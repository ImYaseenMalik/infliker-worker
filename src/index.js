export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- AUTH CHECK ---
    const isWrite = ["POST", "PUT", "DELETE"].includes(request.method);
    if (isWrite) {
      const apiKey = request.headers.get("X-API-KEY");
      if (!apiKey || apiKey !== env.ADMIN_API_KEY) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403,
        });
      }
    }

    // ROUTES
    if (url.pathname === "/api/posts" && request.method === "GET") {
      return listPosts(env);
    }

    if (url.pathname.startsWith("/api/posts/") && request.method === "GET") {
      const id = url.pathname.split("/")[3];
      return getPost(env, id);
    }

    if (url.pathname === "/api/posts" && request.method === "POST") {
      return createPost(request, env);
    }

    if (url.pathname.startsWith("/api/posts/") && request.method === "PUT") {
      const id = url.pathname.split("/")[3];
      return updatePost(request, env, id);
    }

    if (url.pathname.startsWith("/api/posts/") && request.method === "DELETE") {
      const id = url.pathname.split("/")[3];
      return deletePost(env, id);
    }

    if (url.pathname === "/api/upload-url" && request.method === "POST") {
      return createUploadUrl(env);
    }

    return new Response("Not Found", { status: 404 });
  },
};

// --- FUNCTIONS ---
async function listPosts(env) {
  const { results } = await env.POSTS_DB.prepare(
    "SELECT * FROM posts ORDER BY created_at DESC"
  ).all();

  return Response.json(results);
}

async function getPost(env, id) {
  const post = await env.POSTS_DB.prepare(
    "SELECT * FROM posts WHERE id = ?"
  ).bind(id).first();

  return Response.json(post || {});
}

async function createPost(request, env) {
  const data = await request.json();
  await env.POSTS_DB.prepare(
    "INSERT INTO posts (title, content, created_at) VALUES (?, ?, datetime('now'))"
  ).bind(data.title, data.content).run();

  return Response.json({ success: true });
}

async function updatePost(request, env, id) {
  const data = await request.json();
  await env.POSTS_DB.prepare(
    "UPDATE posts SET title = ?, content = ? WHERE id = ?"
  ).bind(data.title, data.content, id).run();

  return Response.json({ success: true });
}

async function deletePost(env, id) {
  await env.POSTS_DB.prepare(
    "DELETE FROM posts WHERE id = ?"
  ).bind(id).run();

  return Response.json({ success: true });
}

async function createUploadUrl(env) {
  const key = crypto.randomUUID() + ".jpg";

  const url = await env.MEDIA_R2.createPresignedUrl({
    key,
    method: "PUT"
  });

  return Response.json({ uploadUrl: url, key });
}
