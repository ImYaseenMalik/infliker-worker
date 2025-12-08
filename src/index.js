import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Database middleware
app.use('*', async (c, next) => {
  c.db = c.env.DB
  await next()
})

// Basic routes for testing
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Infliker CMS</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
            .container { text-align: center; }
            h1 { color: #4f46e5; }
            .links { margin-top: 30px; }
            .btn { display: inline-block; padding: 12px 24px; margin: 10px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; }
            .btn:hover { background: #4338ca; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Infliker CMS</h1>
            <p>Your Cloudflare-powered CMS is running!</p>
            
            <div class="links">
                <a href="/dashboard" class="btn">Dashboard</a>
                <a href="/login" class="btn">Login</a>
                <a href="/api/health" class="btn">API Health</a>
                <a href="https://infliker.fun" class="btn">Main Site</a>
            </div>
            
            <div style="margin-top: 40px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
                <h3>Quick Setup:</h3>
                <p>1. Database tables created? Check <a href="/api/test-db">/api/test-db</a></p>
                <p>2. Admin user created? Username: <strong>admin</strong>, Password: <strong>admin123</strong></p>
                <p>3. Change default password immediately!</p>
            </div>
        </div>
    </body>
    </html>
  `)
})

// Dashboard
app.get('/dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dashboard - Infliker CMS</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
            .sidebar { width: 250px; background: white; height: 100vh; position: fixed; padding: 20px; box-shadow: 2px 0 5px rgba(0,0,0,0.1); }
            .main { margin-left: 250px; padding: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #4f46e5; margin-bottom: 40px; }
            .nav-item { padding: 12px; margin: 5px 0; border-radius: 6px; cursor: pointer; }
            .nav-item:hover { background: #f3f4f6; }
            .nav-item.active { background: #4f46e5; color: white; }
        </style>
    </head>
    <body>
        <div class="sidebar">
            <div class="logo">Infliker CMS</div>
            <div class="nav-item active">📊 Dashboard</div>
            <div class="nav-item">📝 Posts</div>
            <div class="nav-item">📄 Pages</div>
            <div class="nav-item">🎨 Themes</div>
            <div class="nav-item">⚙️ Settings</div>
            <div class="nav-item">👥 Users</div>
        </div>
        <div class="main">
            <h1>Welcome to Dashboard</h1>
            <p>CMS functionality coming soon...</p>
            <p>Visit <a href="/api">/api</a> for API endpoints</p>
        </div>
    </body>
    </html>
  `)
})

// Login page
app.get('/login', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login - Infliker CMS</title>
        <style>
            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .login-box { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); width: 100%; max-width: 400px; }
            h2 { color: #333; margin-bottom: 30px; text-align: center; }
            .input-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; color: #555; }
            input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
            button { width: 100%; padding: 12px; background: #4f46e5; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
            button:hover { background: #4338ca; }
            .error { color: red; margin-top: 10px; display: none; }
        </style>
    </head>
    <body>
        <div class="login-box">
            <h2>🔐 Admin Login</h2>
            <form id="loginForm">
                <div class="input-group">
                    <label>Username</label>
                    <input type="text" id="username" value="admin" required>
                </div>
                <div class="input-group">
                    <label>Password</label>
                    <input type="password" id="password" value="admin123" required>
                </div>
                <button type="submit">Login</button>
                <div class="error" id="errorMsg">Invalid credentials</div>
            </form>
        </div>
        <script>
            document.getElementById('loginForm').onsubmit = async (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({username, password})
                });
                
                if (response.ok) {
                    window.location.href = '/dashboard';
                } else {
                    document.getElementById('errorMsg').style.display = 'block';
                }
            };
        </script>
    </body>
    </html>
  `)
})

// API Routes
const api = new Hono()
app.route('/api', api)

// Test database connection
api.get('/test-db', async (c) => {
  try {
    const result = await c.db.prepare('SELECT 1 as test').first()
    return c.json({ success: true, database: 'connected', result })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Health check
api.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    service: 'Infliker CMS',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT
  })
})

// Login API
api.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json()
    
    // Get user from database
    const user = await c.db.prepare(
      'SELECT * FROM users WHERE username = ?'
    ).bind(username).first()
    
    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 401)
    }
    
    // Simple password hash check (SHA256)
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    
    if (hashedPassword === user.password_hash) {
      return c.json({ 
        success: true, 
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      })
    } else {
      return c.json({ success: false, message: 'Invalid password' }, 401)
    }
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get all posts
api.get('/posts', async (c) => {
  try {
    const posts = await c.db.prepare(
      'SELECT * FROM posts ORDER BY created_at DESC LIMIT 50'
    ).all()
    return c.json({ success: true, posts: posts.results })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Create post
api.post('/posts', async (c) => {
  try {
    const data = await c.req.json()
    
    const result = await c.db.prepare(
      `INSERT INTO posts (title, slug, content, excerpt, status, author_id) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      data.title,
      data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      data.content,
      data.excerpt || '',
      data.status || 'draft',
      1
    ).run()
    
    return c.json({ 
      success: true, 
      id: result.meta.last_row_id,
      message: 'Post created successfully'
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Get settings
api.get('/settings', async (c) => {
  try {
    const settings = await c.db.prepare(
      'SELECT key, value FROM settings'
    ).all()
    
    const settingsObj = {}
    settings.results.forEach(s => {
      settingsObj[s.key] = s.value
    })
    
    return c.json({ success: true, settings: settingsObj })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Update settings
api.post('/settings', async (c) => {
  try {
    const data = await c.req.json()
    
    for (const [key, value] of Object.entries(data)) {
      await c.db.prepare(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)'
      ).bind(key, value).run()
    }
    
    return c.json({ success: true, message: 'Settings updated' })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 404 handler
app.notFound((c) => {
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>404 - Page Not Found</title>
        <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #666; }
            a { color: #4f46e5; }
        </style>
    </head>
    <body>
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <p><a href="/">Go to homepage</a></p>
    </body>
    </html>
  `, 404)
})

export default app
