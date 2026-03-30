export const config = { runtime: 'edge' };

const _0xB = "aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20=";
const TARGET = atob(_0xB);

export default async function handler(req) {
  const url = new URL(req.url);
  
  // Вырезаем хвост для Google (v1beta/...)
  const regex = /\/v1(beta|alpha)?\//;
  const match = url.pathname.match(regex);
  const path = match ? url.pathname.substring(match.index) : url.pathname;
  
  const targetUrl = new URL(path + url.search, TARGET);

  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  try {
    const h = new Headers(req.headers);
    h.delete("host"); h.delete("origin"); h.delete("referer");

    // Для Edge-функций используем простую пересылку тела
    const res = await fetch(targetUrl, {
      method: req.method,
      headers: h,
      body: req.method === "POST" ? req.body : null,
      duplex: 'half' // Это важно для потоковой передачи в Vercel
    });

    const outH = new Headers(res.headers);
    Object.entries(cors).forEach(([k, v]) => outH.set(k, v));
    outH.delete("content-encoding");

    return new Response(res.body, { status: res.status, headers: outH });
  } catch (e) {
    return new Response(e.message, { status: 500, headers: cors });
  }
}
