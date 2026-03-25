export const config = { runtime: 'edge' };

export default async (req) => {
  const url = new URL(req.url);
  
  // 1. Исправляем путь: убираем /api из начала, если Chatbox его прислал
  url.pathname = url.pathname.replace(/^\/api/, '');
  url.host = 'generativelanguage.googleapis.com';

  // 2. Обработка CORS (чтобы Chatbox не пугался)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // Если это предварительный запрос (OPTIONS), сразу отвечаем "ОК"
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    // Добавляем разрешения к ответу от Google
    const newHeaders = new Headers(response.headers);
    Object.keys(corsHeaders).forEach(key => newHeaders.set(key, corsHeaders[key]));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy Error: ' + e.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
};
