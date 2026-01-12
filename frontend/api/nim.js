
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
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
