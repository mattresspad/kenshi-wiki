// No mail binding, asset fallback, request-body reads or outbound fetches.
export function maintenanceResponse(request, {page, documents}) {
  const path = new URL(request.url).pathname;
  const readable = request.method === 'GET' || request.method === 'HEAD';
  const headers = {'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer'};
  if (readable && Object.hasOwn(documents, path)) {
    const document = documents[path];
    return new Response(request.method === 'HEAD' ? null : Uint8Array.from(atob(document.base64), c=>c.charCodeAt(0)), {
      status:200, headers:{...headers, 'Content-Type':document.type}
    });
  }
  headers['Retry-After'] = '3600';
  headers['X-Wiki-Maintenance'] = '1';
  headers['Content-Type'] = path.startsWith('/api/') ? 'application/json; charset=utf-8' : 'text/html; charset=utf-8';
  headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
  const body = path.startsWith('/api/') ? JSON.stringify({error:'Kenshi Wiki is undergoing maintenance. Please email admin@kenshi.wiki.'}) : page;
  return new Response(request.method === 'HEAD' ? null : body, {status:503, headers});
}
