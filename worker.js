/** Shared page-visit counter. Deploy separately as a Cloudflare Worker.
 * D1 binding: DB. Text variable: ALLOWED_ORIGINS (comma-separated origins).
 * No browser API keys, cookies, fingerprints, or per-visitor database records.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowed = String(env.ALLOWED_ORIGINS || 'https://tnirob30.github.io')
      .split(',').map(x => x.trim()).filter(Boolean);
    const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
    if (allowed.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
      headers['Access-Control-Max-Age'] = '86400';
    }
    const reply = (body, status=200) => new Response(JSON.stringify(body), {status, headers});
    if (!['/','/visits'].includes(url.pathname)) return reply({error:'Not found'},404);
    if (request.method === 'OPTIONS') {
      return allowed.includes(origin) ? new Response(null,{status:204,headers}) : reply({error:'Origin not allowed'},403);
    }
    if (!['GET','POST'].includes(request.method)) return reply({error:'Method not allowed'},405);
    // GET supports reading the shared total and checking setup. POST counts a visit.
    if (request.method === 'POST' && !allowed.includes(origin)) return reply({error:'Origin not allowed'},403);
    if (!env.DB) return reply({error:'Attach the D1 database with binding name DB'},503);
    try {
      const sql = request.method === 'POST'
        ? 'UPDATE visits SET total = total + 1 WHERE id = 1 RETURNING total'
        : 'SELECT total FROM visits WHERE id = 1';
      const row = await env.DB.prepare(sql).first();
      if (!row || !Number.isSafeInteger(row.total)) return reply({error:'Run schema.sql in the D1 database console'},503);
      return reply({count:row.total});
    } catch {
      return reply({error:'Counter unavailable; check the D1 binding and schema'},503);
    }
  }
};
