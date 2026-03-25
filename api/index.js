export const config = { runtime: 'edge' };

export default async (req) => {
  const url = new URL(req.url);
  
  // 1. Настройка "вседозволенности" (CORS)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
  };

  // 2. Тест для браузера
  if (url.pathname === '/api' || url.pathname === '/api/') {
    return new Response("Брат, прокси на связи! Попробуй в Chatbox два варианта адреса:\n1. https://gemini-proxy-pi-ten.vercel.app/api\n2. https://gemini-proxy-pi-ten.vercel.app", { 
      status: 200, 
      headers: { 'Content-Type': 'text/plain; charset=utf-8', ...corsHeaders } 
    });
  }

  // 3. Предварительная проверка связи (Preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // 4. Формируем новый адрес для Гугла
  const targetPath = url.pathname.replace(/^\/api/, '');
  const targetUrl = `https://generativelanguage.googleapis.com${targetPath}${url.search}`;

  try {
    // Копируем все заголовки из Chatbox, кроме Host
    const headers = new Headers(req.headers);
    headers.set('Host', 'generativelanguage.googleapis.com');

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
    });

    // Собираем ответ и добавляем наши разрешения
    const responseHeaders = new Headers(response.headers);
    Object.keys(corsHeaders).forEach(key => responseHeaders.set(key, corsHeaders[key]));
    
    // Удаляем сжатие, которое часто вешает мобильные приложения
    responseHeaders.delete('content-encoding');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
};
