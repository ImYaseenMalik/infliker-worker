export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // ---------- ROUTES ----------
    if (url.pathname === "/api/posts") {
      if (request.method === "GET") {
        return await getPosts(env);
      }
      if (request.method === "POST") {
        return await createPost(request, env);
      }
    }

    if (url.pathname.startsWith("/api/images/upload")) {
      return await uploadImage(request, env);
    }

    return new Response("API is running", { status: 200 });
  }
};


// ============= GET ALL POSTS ============
async function getPosts(env) {
  const db = env.POSTS_DB;

  const result = await db.prepare(
    "SELECT id, title, content, created_at FROM posts ORDER BY created_at DESC"
  ).all();

  return Response.json(result);
}


// ============= CREATE POST ===============
async function createPost(request, env) {
  const db = env.POSTS_DB;
  const data = await request.json();

  await db.prepare(
    "INSERT INTO posts (title, content, created_at) VALUES (?, ?, ?)"
  )
  .bind(data.title, data.content, Date.now())
  .run();

  return Response.json({ success: true });
}


// ============= IMAGE UPLOAD TO R2 =============
async function uploadImage(request, env) {
  const bucket = env.IMAGES_BUCKET;

  const form = await request.formData();
  const file = form.get("file");

  if (!file) return new Response("No file", { status: 400 });

  const arrayBuffer = await file.arrayBuffer();

  await bucket.put(file.name, arrayBuffer);

  return Response.json({
    success: true,
    url: `https://${env.IMAGES_BUCKET}.r2.cloudflarestorage.com/${file.name}`
  });
}
