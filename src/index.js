import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { dashboardHTML } from './dashboard.js'
import { adminHTML } from './admin.js'
import { handleAPI } from './api.js'
import { initDB } from './database.js'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Initialize database
app.use('*', async (c, next) => {
  try {
    c.db = await initDB(c.env.DB)
    await next()
  } catch (error) {
    console.error('Database error:', error)
    return c.text('Database error', 500)
  }
})

// Serve static files from public folder (if exists)
app.use('/static/*', serveStatic({ root: './public' }))

// Admin login page
app.get('/login', (c) => {
  return c.html(adminHTML)
})

// Dashboard
app.get('/dashboard', (c) => {
  return c.html(dashboardHTML)
})

// API routes
app.route('/api', handleAPI)

// Authentication middleware for protected routes
const authMiddleware = async (c, next) => {
  // Simple session check (implement proper auth in production)
  const authHeader = c.req.header('Authorization')
  const session = c.req.cookie('session')
  
  if (!authHeader && !session) {
    return c.redirect('/login')
  }
  
  await next()
}

// Protected admin routes
app.get('/admin', authMiddleware, (c) => {
  return c.html(adminHTML)
})

// Serve blog posts
app.get('/', async (c) => {
  const posts = await c.db.prepare(
    'SELECT * FROM posts WHERE status = ? ORDER BY published_at DESC LIMIT 10'
  ).bind('published').all()
  
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Infliker Blog</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .post { border-bottom: 1px solid #eee; padding: 20px 0; }
            .post h2 a { color: #333; text-decoration: none; }
            .post h2 a:hover { color: #4f46e5; }
            .post-meta { color: #666; font-size: 0.9rem; }
            .read-more { color: #4f46e5; text-decoration: none; }
        </style>
    </head>
    <body>
        <header style="margin-bottom: 2rem;">
            <h1>Blog</h1>
            <p>Welcome to Infliker CMS Blog</p>
        </header>
        
        ${posts.results.length > 0 ? posts.results.map(post => `
            <div class="post">
                <h2><a href="/post/${post.slug}">${post.title}</a></h2>
                <div class="post-meta">
                    ${post.published_at ? `Published: ${new Date(post.published_at).toLocaleDateString()}` : ''}
                </div>
                <p>${post.excerpt || post.content.substring(0, 200)}...</p>
                <a href="/post/${post.slug}" class="read-more">Read more →</a>
            </div>
        `).join('') : '<p>No posts yet. Check back soon!</p>'}
        
        <footer style="margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #eee;">
            <p><a href="/dashboard">Admin Dashboard</a> | <a href="https://infliker.fun">Home</a></p>
        </footer>
    </body>
    </html>
  `)
})

// Serve single post
app.get('/post/:slug', async (c) => {
  const slug = c.req.param('slug')
  
  const post = await c.db.prepare(
    'SELECT * FROM posts WHERE slug = ? AND status = ?'
  ).bind(slug, 'published').first()
  
  if (!post) {
    return c.notFound()
  }
  
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>${post.title} - Infliker Blog</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .post-header { margin-bottom: 2rem; }
            .post-content { line-height: 1.6; }
            .post-content img { max-width: 100%; height: auto; }
            .back-link { display: inline-block; margin-top: 2rem; color: #4f46e5; text-decoration: none; }
        </style>
    </head>
    <body>
        <article>
            <div class="post-header">
                <h1>${post.title}</h1>
                <div style="color: #666; margin-top: 0.5rem;">
                    ${post.published_at ? `Published on ${new Date(post.published_at).toLocaleDateString()}` : ''}
                </div>
            </div>
            
            <div class="post-content">
                ${post.content}
            </div>
            
            <a href="/" class="back-link">← Back to all posts</a>
        </article>
    </body>
    </html>
  `)
})

// 404 handler
app.notFound((c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Page Not Found</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { font-size: 3rem; color: #dc2626; }
            a { color: #4f46e5; text-decoration: none; }
        </style>
    </head>
    <body>
        <h1>404</h1>
        <p>Page not found</p>
        <p><a href="/">Go to homepage</a></p>
    </body>
    </html>
  `, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Server Error</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #dc2626; }
        </style>
    </head>
    <body>
        <h1>500 - Server Error</h1>
        <p>Something went wrong. Please try again later.</p>
        <p><a href="/">Go to homepage</a></p>
    </body>
    </html>
  `, 500)
})

export default app
