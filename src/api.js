import { Hono } from 'hono'

export const handleAPI = new Hono()

// Get dashboard stats
handleAPI.get('/stats', async (c) => {
  const db = c.db
  
  const totalPosts = await db.prepare(
    'SELECT COUNT(*) as count FROM posts'
  ).first()
  
  const publishedPosts = await db.prepare(
    'SELECT COUNT(*) as count FROM posts WHERE status = ?'
  ).bind('published').first()
  
  const totalPages = await db.prepare(
    'SELECT COUNT(*) as count FROM pages WHERE status = ?'
  ).bind('published').first()
  
  const activeTheme = await db.prepare(
    'SELECT name FROM themes WHERE is_active = 1'
  ).first()
  
  return c.json({
    totalPosts: totalPosts.count,
    publishedPosts: publishedPosts.count,
    totalPages: totalPages.count,
    activeTheme: activeTheme ? activeTheme.name : 'Default'
  })
})

// Posts API
handleAPI.get('/posts', async (c) => {
  const limit = c.req.query('limit') || 10
  const offset = c.req.query('offset') || 0
  
  const posts = await c.db.prepare(
    'SELECT * FROM posts ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all()
  
  return c.json(posts.results)
})

handleAPI.get('/posts/:id', async (c) => {
  const id = c.req.param('id')
  
  const post = await c.db.prepare(
    'SELECT * FROM posts WHERE id = ?'
  ).bind(id).first()
  
  if (!post) {
    return c.json({ error: 'Post not found' }, 404)
  }
  
  return c.json(post)
})

handleAPI.post('/posts', async (c) => {
  const data = await c.req.json()
  
  const result = await c.db.prepare(
    `INSERT INTO posts (title, slug, content, excerpt, status, author_id, published_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    data.title,
    data.slug,
    data.content,
    data.excerpt || null,
    data.status || 'draft',
    1, // Default author ID
    data.status === 'published' ? new Date().toISOString() : null
  ).run()
  
  return c.json({ id: result.lastInsertId, success: true })
})

handleAPI.put('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  
  await c.db.prepare(
    `UPDATE posts 
     SET title = ?, slug = ?, content = ?, excerpt = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).bind(
    data.title,
    data.slug,
    data.content,
    data.excerpt || null,
    data.status || 'draft',
    id
  ).run()
  
  return c.json({ success: true })
})

handleAPI.delete('/posts/:id', async (c) => {
  const id = c.req.param('id')
  
  await c.db.prepare(
    'DELETE FROM posts WHERE id = ?'
  ).bind(id).run()
  
  return c.json({ success: true })
})

// Pages API
handleAPI.get('/pages', async (c) => {
  const pages = await c.db.prepare(
    'SELECT * FROM pages ORDER BY created_at DESC'
  ).all()
  
  return c.json(pages.results)
})

handleAPI.post('/pages', async (c) => {
  const data = await c.req.json()
  
  const result = await c.db.prepare(
    `INSERT INTO pages (title, slug, content, status) 
     VALUES (?, ?, ?, ?)`
  ).bind(
    data.title,
    data.slug,
    data.content,
    data.status || 'published'
  ).run()
  
  return c.json({ id: result.lastInsertId, success: true })
})

// Themes API
handleAPI.get('/themes', async (c) => {
  const themes = await c.db.prepare(
    'SELECT * FROM themes ORDER BY is_active DESC, created_at DESC'
  ).all()
  
  return c.json(themes.results)
})

handleAPI.post('/themes', async (c) => {
  const data = await c.req.json()
  
  // Deactivate all themes first
  await c.db.prepare(
    'UPDATE themes SET is_active = 0'
  ).run()
  
  const result = await c.db.prepare(
    `INSERT INTO themes (name, slug, styles, template, is_active) 
     VALUES (?, ?, ?, ?, ?)`
  ).bind(
    data.name,
    data.slug,
    data.styles || '',
    data.template || '',
    data.is_active || 0
  ).run()
  
  return c.json({ id: result.lastInsertId, success: true })
})

// Settings API
handleAPI.get('/settings', async (c) => {
  const settings = await c.db.prepare(
    'SELECT * FROM settings'
  ).all()
  
  const settingsObj = {}
  settings.results.forEach(setting => {
    settingsObj[setting.key] = setting.value
  })
  
  return c.json(settingsObj)
})

handleAPI.post('/settings', async (c) => {
  const data = await c.req.json()
  
  for (const [key, value] of Object.entries(data)) {
    await c.db.prepare(
      `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`
    ).bind(key, value).run()
  }
  
  return c.json({ success: true })
})
