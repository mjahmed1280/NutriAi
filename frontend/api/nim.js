
export const config = {
  runtime: 'edge',
};

const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getCorsHeaders(origin, allowedOrigin) {
  const allowed =
    (origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) ||
    (origin && allowedOrigin && origin === allowedOrigin);
  return allowed ? { ...CORS_HEADERS, 'Access-Control-Allow-Origin': origin } : CORS_HEADERS;
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
  const corsHeaders = getCorsHeaders(origin, allowedOrigin);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  // Origin check — block requests from unknown origins (skip check if origin header absent)
  if (origin && !origin.startsWith('http://localhost') && !origin.startsWith('http://127.0.0.1')) {
    if (!allowedOrigin || origin !== allowedOrigin) {
      return new Response('Forbidden: Invalid Origin', { status: 403, headers: corsHeaders });
    }
  }

  // ---------------------------------------------------------
  // Rate Limiting (Global Daily Limit: 30) via Vercel KV (Upstash)
  // ---------------------------------------------------------
  const KV_URL = process.env.ratelimitstore_KV_REST_API_URL || process.env.KV_REST_API_URL;
  const KV_TOKEN = process.env.ratelimitstore_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN;

  if (KV_URL && KV_TOKEN) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `nutriai_global_limit_${today}`;

      // 1. Increment the counter
      const incrRes = await fetch(`${KV_URL}/INCR/${key}`, {
        headers: { Authorization: `Bearer ${KV_TOKEN}` }
      });
      const { result: currentCount } = await incrRes.json();

      // 2. If this is the first request of the day, set expiry (24h) — awaited so it can't silently fail
      if (currentCount === 1) {
        try {
          await fetch(`${KV_URL}/EXPIRE/${key}/86400`, {
            headers: { Authorization: `Bearer ${KV_TOKEN}` }
          });
        } catch (expireErr) {
          console.error("Failed to set KV EXPIRE — counter may not reset:", expireErr);
        }
      }

      // 3. Check limit
      if (currentCount > 30) {
        return new Response(
          JSON.stringify({ error: "Daily API Limit Exceeded (30/30). Please try again tomorrow." }),
          {
            status: 429,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    } catch (kvError) {
      console.error("Rate limit check failed:", kvError);
      // Fail open: allow request if KV is unreachable
    }
  }

  try {
    const { messages, model, max_tokens, temperature, top_p } = await req.json();

    const apiKey = process.env.NIM_KEY;
    if (!apiKey) {
      return new Response('Server Configuration Error: Missing NIM_KEY', { status: 500, headers: corsHeaders });
    }

    const nvidiaResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "text/event-stream",
      },
      body: JSON.stringify({
        model: model || "meta/llama-4-maverick-17b-128e-instruct",
        messages,
        stream: true,
        max_tokens: max_tokens || 1024,
        temperature: temperature || 0.5,
        top_p: top_p || 1.0,
      }),
    });

    if (!nvidiaResponse.ok) {
      const errorText = await nvidiaResponse.text();
      return new Response(
        `Upstream API Error: ${nvidiaResponse.status} ${errorText}`,
        { status: nvidiaResponse.status, headers: corsHeaders }
      );
    }

    return new Response(nvidiaResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        ...corsHeaders,
      },
    });

  } catch (error) {
    return new Response(`Internal Server Error: ${error.message}`, { status: 500, headers: corsHeaders });
  }
}
