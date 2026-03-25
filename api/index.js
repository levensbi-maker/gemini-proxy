export const config = { runtime: 'edge' };

export default async (req) => {
  const url = new URL(req.url);
  
  // Заголовки для обхода блокировок безопасности (CORS)
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // ТЕСТ: Если просто зайти по ссылке в браузере, увидишь это сообщение
  if (url.pathname === '/api' || url.pathname === '/api/') {
    return new Response("Брат, прокси работает! Вставляй этот адрес в Chatbox.", { status: 200, headers: corsHeaders });
  }

  // Ответ на проверку связи от приложения
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Исправляем путь для Google
  url.pathname = url.pathname.replace(/^\/api/, '');
  url.host = 'generativelanguage.googleapis.com';

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.body,
    });

    const newHeaders = new Headers(response.headers);
    Object.keys(corsHeaders).forEach(key => newHeaders.set(key, corsHeaders[key]));
    
    // Убираем сжатие, которое может ломать ответы на мобиле
    newHeaders.delete('content-encoding');

    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (e) {
    return new Response("Ошибка: " + e.message, { status: 500, headers: corsHeaders });
  }
};
