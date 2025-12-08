import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { dashboardHTML } from './dashboard.js'
import { adminHTML } from './admin.js'
import { handleAPI } from './api.js'
import { initDB } from './database.js'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Initialize database
app.use('*', async (c, next) => {
  c.db = await initDB(c.env.DB)
  await next()
})

// Serve dashboard
app.get('/dashboard', (c) => {
  return c.html(dashboardHTML)
})

// Serve admin panel
app.get('/admin', (c) => {
  return c.html(adminHTML)
})

// API routes
app.route('/api', handleAPI)

// Static files
app.get('*', async (c) => {
  const url = new URL(c.req.url)
  const pathname = url.pathname
  
  // Try to serve from KV if you have it configured
  // For now, serve basic pages
  if (pathname === '/') {
    return c.html(await renderHomepage(c.db))
  }
  
  if (pathname.startsWith('/blog/')) {
    const slug = pathname.replace('/blog/', '')
    return c.html(await renderPost(c.db, slug))
  }
  
  return c.text('Page not found', 404)
})

async function renderHomepage(db) {
  const posts = await db.prepare(
    'SELECT * FROM posts WHERE status = ? ORDER BY published_at DESC LIMIT 10'
  ).bind('published').all()
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Infliker Blog</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      .post { border-bottom: 1px solid #eee; padding: 20px 0; }
      .post h2 a { color: #333; text-decoration: none; }
    </style>
  </head>
  <body>
    <h1>Blog Posts</h1>
    ${posts.results.map(post => `
      <div class="post">
        <h2><a href="/blog/${post.slug}">${post.title}</a></h2>
        <p>${post.excerpt || post.content.substring(0, 200)}...</p>
      </div>
    `).join('')}
  </body>
  </html>`
}

async function renderPost(db, slug) {
  const post = await db.prepare(
    'SELECT * FROM posts WHERE slug = ? AND status = ?'
  ).bind(slug, 'published').first()
  
  if (!post) {
    return '<h1>Post not found</h1>'
  }
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${post.title}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
      .content { line-height: 1.6; }
    </style>
  </head>
  <body>
    <h1>${post.title}</h1>
    <div class="content">${post.content}</div>
  </body>
  </html>`
}

export default app
