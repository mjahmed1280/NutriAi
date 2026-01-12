
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Basic Security: Origin Check
  const origin = req.headers.get('origin') || req.headers.get('referer');
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'vercel.app';
  
  if (origin && !origin.includes('localhost') && !origin.includes(allowedOrigin)) {
      return new Response('Forbidden: Invalid Origin', { status: 403 });
  }

  // ---------------------------------------------------------
  // Rate Limiting (Global Daily Limit: 50) via Vercel KV (Upstash)
  // ---------------------------------------------------------
  // Try specific store variables first, then fallback to generic defaults
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

      // 2. If this is the first request of the day, set expiry (24h)
      if (currentCount === 1) {
        // Run in background (fire and forget) to save latency
        fetch(`${KV_URL}/EXPIRE/${key}/86400`, {
          headers: { Authorization: `Bearer ${KV_TOKEN}` }
        });
      }

      // 3. Check Limit
      if (currentCount > 50) {
        return new Response(
          JSON.stringify({ error: "Daily API Limit Exceeded (50/50). Please try again tomorrow." }), 
          { 
            status: 429, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
    } catch (kvError) {
      console.error("Rate limit check failed:", kvError);
      // Fail open: If DB is down, allow request to proceed
    }
  }

  try {
    const { messages, model, max_tokens, temperature, top_p } = await req.json();

    const apiKey = process.env.NIM_KEY;
    if (!apiKey) {
      return new Response('Server Configuration Error: Missing NIM_KEY', { status: 500 });
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
        return new Response(`Upstream API Error: ${nvidiaResponse.status} ${errorText}`, { status: nvidiaResponse.status });
    }

    return new Response(nvidiaResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    return new Response(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
