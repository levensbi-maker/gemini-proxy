export const config = { runtime: 'edge' };

const _0xBase = "aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20=";
const TARGET = atob(_0xBase);

export default async function handler(req) {
  const url = new URL(req.url);

  // Умный поиск начала пути API Gemini
  const regex = /\/v1(beta|alpha)?\//;
  const match = url.pathname.match(regex);
  const path = match ? url.pathname.substring(match.index) : url.pathname;
  
  const targetUrl = new URL(path + url.search, TARGET);

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });

  try {
    const filteredHeaders = new Headers(req.headers);
    filteredHeaders.delete("host");
    filteredHeaders.delete("origin");
    filteredHeaders.delete("referer");

    const res = await fetch(targetUrl, {
      method: req.method,
      headers: filteredHeaders,
      body: req.method === "POST" ? req.body : null,
      redirect: "follow",
    });

    const outHeaders = new Headers(res.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => outHeaders.set(k, v));
    outHeaders.delete("content-encoding");

    return new Response(res.body, { status: res.status, headers: outHeaders });
  } catch (e) {
    return new Response(e.message, { status: 500, headers: corsHeaders });
  }
}
