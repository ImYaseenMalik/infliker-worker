export async function initDB(envDB) {
  // This function sets up the database connection
  // The actual connection is provided by Cloudflare
  
  // Create tables if they don't exist (using raw SQL)
  const initSQL = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'author',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id INTEGER,
        status TEXT DEFAULT 'draft',
        published_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
    );
    
    CREATE TABLE IF NOT EXISTS pages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'published',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS themes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        styles TEXT,
        template TEXT,
        is_active BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `
  
  // Split SQL statements and execute them
  const statements = initSQL.split(';').filter(sql => sql.trim())
  for (const sql of statements) {
    try {
      await envDB.prepare(sql).run()
    } catch (error) {
      console.error('Error executing SQL:', sql, error)
    }
  }
  
  // Insert default data if empty
  const userCount = await envDB.prepare(
    'SELECT COUNT(*) as count FROM users'
  ).first()
  
  if (userCount.count === 0) {
    // Insert default admin user (password: admin123)
    // In production, use proper password hashing!
    const hashedPassword = await hashPassword('admin123')
    await envDB.prepare(
      `INSERT INTO users (username, password_hash, email, role) 
       VALUES (?, ?, ?, ?)`
    ).bind('admin', hashedPassword, 'admin@infliker.fun', 'admin').run()
    
    // Insert default settings
    const defaultSettings = [
      ['site_title', 'Infliker CMS'],
      ['site_description', 'A modern CMS on Cloudflare'],
      ['theme', 'default'],
      ['posts_per_page', '10']
    ]
    
    for (const [key, value] of defaultSettings) {
      await envDB.prepare(
        `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`
      ).bind(key, value).run()
    }
  }
  
  return envDB
}

// Simple password hashing (use bcrypt in production)
async function hashPassword(password) {
  // This is a simple implementation. In production, use a proper hashing library.
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifyPassword(password, hash) {
  const hashedInput = await hashPassword(password)
  return hashedInput === hash
}
