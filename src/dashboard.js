export const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Infliker CMS Dashboard</title>
    <style>
        :root {
            --primary: #4f46e5;
            --secondary: #7c3aed;
            --dark: #1f2937;
            --light: #f9fafb;
            --gray: #6b7280;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--light);
            color: var(--dark);
        }
        
        .dashboard {
            display: flex;
            min-height: 100vh;
        }
        
        .sidebar {
            width: 250px;
            background: white;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
            padding: 2rem 0;
            position: fixed;
            height: 100vh;
        }
        
        .logo {
            padding: 0 1.5rem 2rem;
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--primary);
            border-bottom: 1px solid #eee;
            margin-bottom: 2rem;
        }
        
        .nav-links {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 0 1rem;
        }
        
        .nav-link {
            padding: 0.8rem 1rem;
            border-radius: 8px;
            text-decoration: none;
            color: var(--gray);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            transition: all 0.3s;
        }
        
        .nav-link:hover, .nav-link.active {
            background: var(--primary);
            color: white;
        }
        
        .nav-link i {
            width: 20px;
        }
        
        .main-content {
            flex: 1;
            margin-left: 250px;
            padding: 2rem;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #eee;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            color: var(--gray);
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .stat-card .value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary);
        }
        
        .quick-actions {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .action-buttons {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-top: 1rem;
        }
        
        .btn {
            padding: 0.8rem 1.5rem;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .btn-primary {
            background: var(--primary);
            color: white;
        }
        
        .btn-secondary {
            background: #e5e7eb;
            color: var(--dark);
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        
        @media (max-width: 768px) {
            .sidebar {
                width: 60px;
            }
            
            .sidebar .logo span,
            .sidebar .nav-link span {
                display: none;
            }
            
            .main-content {
                margin-left: 60px;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="dashboard">
        <div class="sidebar">
            <div class="logo">
                <i class="fas fa-rocket"></i>
                <span>Infliker CMS</span>
            </div>
            <div class="nav-links">
                <a href="#dashboard" class="nav-link active">
                    <i class="fas fa-tachometer-alt"></i>
                    <span>Dashboard</span>
                </a>
                <a href="#posts" class="nav-link">
                    <i class="fas fa-newspaper"></i>
                    <span>Posts</span>
                </a>
                <a href="#pages" class="nav-link">
                    <i class="fas fa-file-alt"></i>
                    <span>Pages</span>
                </a>
                <a href="#themes" class="nav-link">
                    <i class="fas fa-palette"></i>
                    <span>Themes</span>
                </a>
                <a href="#settings" class="nav-link">
                    <i class="fas fa-cogs"></i>
                    <span>Settings</span>
                </a>
                <a href="#users" class="nav-link">
                    <i class="fas fa-users"></i>
                    <span>Users</span>
                </a>
                <a href="https://infliker.fun" class="nav-link">
                    <i class="fas fa-external-link-alt"></i>
                    <span>View Site</span>
                </a>
            </div>
        </div>
        
        <div class="main-content">
            <div class="header">
                <h1>Dashboard Overview</h1>
                <div class="user-menu">
                    <button class="btn btn-secondary">
                        <i class="fas fa-user"></i>
                        Admin
                    </button>
                </div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Posts</h3>
                    <div class="value" id="totalPosts">0</div>
                </div>
                <div class="stat-card">
                    <h3>Published</h3>
                    <div class="value" id="publishedPosts">0</div>
                </div>
                <div class="stat-card">
                    <h3>Total Pages</h3>
                    <div class="value" id="totalPages">0</div>
                </div>
                <div class="stat-card">
                    <h3>Active Theme</h3>
                    <div class="value" id="activeTheme">Default</div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h2>Quick Actions</h2>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="createNewPost()">
                        <i class="fas fa-plus"></i>
                        New Post
                    </button>
                    <button class="btn btn-primary" onclick="createNewPage()">
                        <i class="fas fa-file-alt"></i>
                        New Page
                    </button>
                    <button class="btn btn-secondary" onclick="manageThemes()">
                        <i class="fas fa-palette"></i>
                        Theme Editor
                    </button>
                    <button class="btn btn-secondary" onclick="openSettings()">
                        <i class="fas fa-cogs"></i>
                        Site Settings
                    </button>
                </div>
            </div>
            
            <div class="quick-actions">
                <h2>Recent Posts</h2>
                <div id="recentPosts">
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        async function loadDashboardData() {
            try {
                // Load stats
                const statsResponse = await fetch('/api/stats');
                const stats = await statsResponse.json();
                
                document.getElementById('totalPosts').textContent = stats.totalPosts;
                document.getElementById('publishedPosts').textContent = stats.publishedPosts;
                document.getElementById('totalPages').textContent = stats.totalPages;
                document.getElementById('activeTheme').textContent = stats.activeTheme;
                
                // Load recent posts
                const postsResponse = await fetch('/api/posts?limit=5');
                const posts = await postsResponse.json();
                
                const postsHTML = posts.map(post => \`
                    <div style="padding: 1rem; border-bottom: 1px solid #eee;">
                        <h3 style="margin-bottom: 0.5rem;">\${post.title}</h3>
                        <p style="color: #666; font-size: 0.9rem;">
                            Status: \${post.status} | 
                            Created: \${new Date(post.created_at).toLocaleDateString()}
                        </p>
                    </div>
                \`).join('');
                
                document.getElementById('recentPosts').innerHTML = postsHTML || '<p>No posts yet</p>';
                
            } catch (error) {
                console.error('Error loading dashboard:', error);
            }
        }
        
        function createNewPost() {
            window.location.href = '/admin?action=new-post';
        }
        
        function createNewPage() {
            window.location.href = '/admin?action=new-page';
        }
        
        function manageThemes() {
            window.location.href = '/admin?action=themes';
        }
        
        function openSettings() {
            window.location.href = '/admin?action=settings';
        }
        
        // Load data when page loads
        document.addEventListener('DOMContentLoaded', loadDashboardData);
        
        // Navigation handling
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    const section = this.getAttribute('href').substring(1);
                    loadSection(section);
                }
            });
        });
        
        function loadSection(section) {
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            event.target.closest('.nav-link').classList.add('active');
            
            // Load section content (you'll implement this)
            console.log('Loading section:', section);
        }
    </script>
</body>
</html>`
