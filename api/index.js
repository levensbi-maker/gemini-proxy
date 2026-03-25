export const config = { runtime: 'edge' };
export default async (req) => {
  const url = new URL(req.url);
  url.host = 'generativelanguage.googleapis.com';
  return fetch(url, {
    method: req.method,
    headers: req.headers,
    body: req.body,
  });
};
