export const config = { runtime: 'edge' };

export default async (req) => {
  const url = new URL(req.url);
  
  // 1. Тотальные разрешения для любого приложения (CORS)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': '*', 
    'Access-Control-Max-Age': '86400',
  };

  // 2. Тест для браузера (чтобы ты видел, что всё ок)
  if (url.pathname === '/api' || url.pathname === '/api/') {
    return new Response("Брат, прокси в норме! Ссылка для Chatbox: " + url.origin + "/api", { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders } 
    });
  }

  // 3. Ответ на "разведку" приложения (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 4. Перенаправление на Google
  url.host = 'generativelanguage.googleapis.com';
  url.pathname = url.pathname.replace(/^\/api/, '');

  try {
    // Копируем заголовки, но убираем те, что могут мешать
    const headers = new Headers(req.headers);
    headers.delete('host');

    const response = await fetch(url.toString(), {
      method: req.method,
      headers: headers,
      body: req.body,
    });

    // Добавляем наши CORS-разрешения к ответу от Google
    const responseHeaders = new Headers(response.headers);
    Object.keys(corsHeaders).forEach(key => responseHeaders.set(key, corsHeaders[key]));
    
    // Важно: убираем сжатие, чтобы Chatbox не подавился
    responseHeaders.delete('content-encoding');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (e) {
    return new Response("Ошибка прокси: " + e.message, { status: 500, headers: corsHeaders });
  }
};
