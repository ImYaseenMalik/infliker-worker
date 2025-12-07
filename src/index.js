/**
 * Cloudflare Worker API for CMS
 *
 * Bindings expected in the Worker environment (set via Cloudflare dashboard):
 * - D1 (binding name): POSTS_DB  (a Cloudflare D1 binding)
 * - R2 bucket binding: MEDIA_R2 (optional, for signed URL verification if needed)
 * - SECRET: ADMIN_API_KEY (a secret API key string)
 *
 * Routes:
 * GET  /api/posts            -> list posts
 * GET  /api/posts/:id        -> get a single post
 * POST /api/posts            -> create post (requires X-API-KEY)
 * PUT  /api/posts/:id        -> update post (requires X-API-KEY)
 * DELETE /api/posts/:id      -> delete post (requires X-API-KEY)
 * POST /api/upload-url      -> returns presigned URL to PUT to R2 (requires X-API-KEY)
 *
 * NOTE: Set ADMIN_API_KEY in Workers secrets via dashboard.
 */

addEventListener('fetch', event => {
  event.respondWith(handle(event.request, event));
});

async function handle(request, event){
  const url = new URL(request.url);
  const pathname = url.pathname;
  // simple router
  if(pathname.startsWith('/api/posts')){
    return postsHandler(request, url, event);
  } else if(pathname === '/api/upload-url' && request.method === 'POST'){
    return uploadUrlHandler(request, event);
  } else if(pathname.startsWith('/r2/')) {
    // proxy simple GET for R2 object: /r2/<objectKey>
    return r2Proxy(request, url, event);
  } else {
    return fetch(request); // let Pages serve static files
  }
}

function unauthorized(resText='Unauthorized'){ return new Response(resText,{status:401}); }

async function requireAuth(request){
  const header = request.headers.get('X-API-KEY') || '';
  const secret = ADMIN_API_KEY; // bound secret from dashboard
  if(!header || header !== secret) throw new Error('unauth');
}

async function postsHandler(request, url, event){
  const db = POSTS_DB; // D1 binding
  const path = url.pathname.replace(/^\/api\/posts\/?/, '');
  try{
    if(request.method === 'GET' && (path === '' || path === '/')){
      // list published posts
      const sql = `SELECT id, slug, title, excerpt, content, created_at FROM posts WHERE status='published' ORDER BY created_at DESC`;
      const res = await db.prepare(sql).all();
      return new Response(JSON.stringify(res.results || []), {headers:{'content-type':'application/json'}});
    }

    if(request.method === 'GET' && path){
      const id = path.replace(/\//g,'');
      const res = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
      return new Response(JSON.stringify(res || {}), {headers:{'content-type':'application/json'}});
    }

    if(request.method === 'POST' && path === ''){
      try{ await requireAuth(request); } catch(e){ return unauthorized(); }
      const body = await request.json();
      const slug = (body.title||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,150);
      const insert = await db.prepare('INSERT INTO posts (slug,title,excerpt,content) VALUES (?,?,?,?)').bind(slug, body.title, body.excerpt, body.content).run();
      const id = insert.lastInsertRowid;
      const row = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
      return new Response(JSON.stringify(row), {headers:{'content-type':'application/json'}});
    }

    if(request.method === 'PUT' && path){
      try{ await requireAuth(request); } catch(e){ return unauthorized(); }
      const id = path.replace(/\//g,'');
      const body = await request.json();
      await db.prepare('UPDATE posts SET title = ?, excerpt = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').bind(body.title, body.excerpt, body.content, id).run();
      const row = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first();
      return new Response(JSON.stringify(row), {headers:{'content-type':'application/json'}});
    }

    if(request.method === 'DELETE' && path){
      try{ await requireAuth(request); } catch(e){ return unauthorized(); }
      const id = path.replace(/\//g,'');
      await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
      return new Response(JSON.stringify({deleted:id}), {headers:{'content-type':'application/json'}});
    }

    return new Response('Not found', {status:404});
  }catch(err){
    if(err.message === 'unauth') return unauthorized();
    return new Response('Server error: '+String(err), {status:500});
  }
}

// R2 presigned URL generation using Cloudflare S3-compatible presign (requires R2 key pair on account)
// We'll generate a temporary signed PUT URL using Cloudflare's R2 presign process via internal API if available,
// but since Workers can't create AWS-sig4 easily without libs here, we'll return a "server-handled" upload token approach.
// For this example we'll generate an object key and return a URL that the worker will accept as PUT (a proxied upload).
// Simpler: client requests presigned URL -> worker accepts file upload to /r2/<objectKey> via PUT and writes to R2 via alarm.
// This example implements proxied upload: client will PUT to /r2/<objectKey> and Worker will `R2.put()` the body.

async function uploadUrlHandler(request, event){
  try{ await requireAuth(request); } catch(e){ return unauthorized(); }
  const body = await request.json();
  const filename = body.filename || `file-${Date.now()}`;
  // safe object key (prefix with uploads/)
  const objectKey = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9_.-]/g,'_')}`;
  // Return an upload endpoint the client can PUT to (this worker will accept PUT to /r2/<objectKey> and write to R2)
  const uploadUrl = new URL(request.url);
  uploadUrl.pathname = `/r2/${objectKey}`;
  return new Response(JSON.stringify({url: uploadUrl.toString(), objectKey}), {headers:{'content-type':'application/json'}});
}

// Proxy PUT to R2: write object
async function r2Proxy(request, url, event){
  // URL: /r2/<objectKey>
  const parts = url.pathname.split('/');
  parts.shift(); // remove leading empty
  parts.shift(); // remove 'r2'
  const objectKey = parts.join('/');
  if(request.method === 'PUT'){
    try{ await requireAuth(request); } catch(e){ return unauthorized(); }
    const body = await request.arrayBuffer();
    // MEDIA_R2 is an R2 binding added in dashboard
    await MEDIA_R2.put(objectKey, body);
    // return object URL (you can create a public fetch route or store full URL)
    return new Response(JSON.stringify({objectKey, url: `/r2/${objectKey}`}), {headers:{'content-type':'application/json'}});
  } else if(request.method === 'GET'){
    // serve object (public access via worker)
    try{
      const obj = await MEDIA_R2.get(objectKey);
      if(!obj) return new Response('Not found', {status:404});
      const headers = new Headers();
      if(obj.httpMetadata && obj.httpMetadata.contentType) headers.set('content-type', obj.httpMetadata.contentType);
      return new Response(obj.body, {headers});
    } catch(e){ return new Response('R2 error: '+String(e), {status:500}); }
  }
  return new Response('Method not allowed', {status:405});
}
