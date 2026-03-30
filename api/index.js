// Тот же фокус с Base64, чтобы не палиться
const _0xBase = "aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20=";
const TARGET = atob(_0xBase);

export const config = { runtime: 'edge' }; // Это делает его сверхбыстрым!

export default async function handler(req) {
  const url = new URL(req.url);
  
  // Если зайти просто браузером
  if (url.pathname === "/api/proxy" && req.method === "GET") {
    return new Response("System Online", { status: 200 });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    // Vercel обрезает /api/proxy, нам нужно достучаться до Google
    const path = url.pathname.replace("/api/proxy", "");
    const targetUrl = new URL(path + url.search, TARGET);

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    const outHeaders = new Headers(res.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => outHeaders.set(k, v));
    outHeaders.delete("content-encoding");

    return new Response(res.body, { status: res.status, headers: outHeaders });
  } catch (e) {
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
}

