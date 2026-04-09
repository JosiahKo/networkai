// Cloudflare Worker — Anthropic API Proxy
// 
// SETUP INSTRUCTIONS:
// 1. Go to workers.cloudflare.com and create a free account
// 2. Create a new Worker and paste this entire file
// 3. Go to Settings → Variables → add a secret called ANTHROPIC_API_KEY
//    and paste your key as the value (never put the key in this code)
// 4. Deploy — you'll get a URL like https://my-proxy.yourname.workers.dev
// 5. In your NetworkAI.html, replace the API fetch URL with your Worker URL

export default {
  async fetch(request, env) {

    // Allow requests from anywhere (or lock it down to your domain below)
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const body = await request.json();

      // Forward to Anthropic — key stays here on the server, never sent to browser
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,   // ← stored as a secret, never visible
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};
