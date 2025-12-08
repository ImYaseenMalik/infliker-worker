export const adminHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Infliker CMS</title>
    <style>
        /* Similar styling to dashboard, but with editor */
        .editor-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .editor-toolbar {
            background: #f8f9fa;
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        
        .editor-content {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
            padding: 2rem;
        }
        
        .editor-main {
            min-height: 500px;
        }
        
        .editor-sidebar {
            border-left: 1px solid #dee2e6;
            padding-left: 2rem;
        }
        
        .form-group {
            margin-bottom: 1.5rem;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: #495057;
        }
        
        .form-control {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ced4da;
            border-radius: 4px;
            font-size: 1rem;
        }
        
        .form-control:focus {
            outline: none;
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        
        textarea.form-control {
            min-height: 300px;
            font-family: monospace;
            resize: vertical;
        }
        
        .btn-save {
            background: #28a745;
            color: white;
            padding: 0.8rem 2rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .btn-save:hover {
            background: #218838;
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
                <a href="/dashboard" class="nav-link">
                    <i class="fas fa-arrow-left"></i>
                    <span>Back to Dashboard</span>
                </a>
            </div>
        </div>
        
        <div class="main-content">
            <div class="header">
                <h1 id="editorTitle">New Post</h1>
                <div class="action-buttons">
                    <button class="btn btn-save" onclick="saveContent()">
                        <i class="fas fa-save"></i>
                        Save
                    </button>
                </div>
            </div>
            
            <div class="editor-container">
                <div class="editor-toolbar">
                    <button class="btn btn-secondary" onclick="formatText('bold')">
                        <i class="fas fa-bold"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="formatText('italic')">
                        <i class="fas fa-italic"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="formatText('h1')">
                        H1
                    </button>
                    <button class="btn btn-secondary" onclick="formatText('h2')">
                        H2
                    </button>
                    <button class="btn btn-secondary" onclick="insertImage()">
                        <i class="fas fa-image"></i>
                    </button>
                    <button class="btn btn-secondary" onclick="insertLink()">
                        <i class="fas fa-link"></i>
                    </button>
                </div>
                
                <div class="editor-content">
                    <div class="editor-main">
                        <div class="form-group">
                            <label for="postTitle">Title</label>
                            <input type="text" id="postTitle" class="form-control" placeholder="Enter post title">
                        </div>
                        
                        <div class="form-group">
                            <label for="postSlug">Slug (URL)</label>
                            <input type="text" id="postSlug" class="form-control" placeholder="post-url-slug">
                        </div>
                        
                        <div class="form-group">
                            <label for="postContent">Content</label>
                            <textarea id="postContent" class="form-control" placeholder="Write your content here..."></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="postExcerpt">Excerpt (Optional)</label>
                            <textarea id="postExcerpt" class="form-control" rows="3" placeholder="Brief summary..."></textarea>
                        </div>
                    </div>
                    
                    <div class="editor-sidebar">
                        <div class="form-group">
                            <label for="postStatus">Status</label>
                            <select id="postStatus" class="form-control">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="postCategory">Category</label>
                            <input type="text" id="postCategory" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label for="postTags">Tags (comma separated)</label>
                            <input type="text" id="postTags" class="form-control">
                        </div>
                        
                        <div class="form-group">
                            <label for="postFeatured">Featured Image URL</label>
                            <input type="url" id="postFeatured" class="form-control" placeholder="https://example.com/image.jpg">
                        </div>
                        
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="postFeaturedFlag">
                                Mark as Featured
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let currentPostId = null;
        
        // Auto-generate slug from title
        document.getElementById('postTitle').addEventListener('input', function() {
            const slugInput = document.getElementById('postSlug');
            if (!slugInput.value || slugInput.value === currentPostId) {
                const slug = this.value
                    .toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .replace(/\s+/g, '-');
                slugInput.value = slug;
            }
        });
        
        function formatText(command) {
            const textarea = document.getElementById('postContent');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            
            let formattedText = selectedText;
            switch(command) {
                case 'bold':
                    formattedText = \`**\${selectedText}**\`;
                    break;
                case 'italic':
                    formattedText = \`*\${selectedText}*\`;
                    break;
                case 'h1':
                    formattedText = \`# \${selectedText}\`;
                    break;
                case 'h2':
                    formattedText = \`## \${selectedText}\`;
                    break;
            }
            
            textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
        }
        
        function insertImage() {
            const url = prompt('Enter image URL:');
            if (url) {
                const textarea = document.getElementById('postContent');
                const cursorPos = textarea.selectionStart;
                const insertText = \`![Image](\${url})\`;
                textarea.value = textarea.value.substring(0, cursorPos) + insertText + textarea.value.substring(cursorPos);
            }
        }
        
        function insertLink() {
            const url = prompt('Enter URL:');
            const text = prompt('Enter link text:', url);
            if (url && text) {
                const textarea = document.getElementById('postContent');
                const cursorPos = textarea.selectionStart;
                const insertText = \`[\${text}](\${url})\`;
                textarea.value = textarea.value.substring(0, cursorPos) + insertText + textarea.value.substring(cursorPos);
            }
        }
        
        async function saveContent() {
            const postData = {
                title: document.getElementById('postTitle').value,
                slug: document.getElementById('postSlug').value,
                content: document.getElementById('postContent').value,
                excerpt: document.getElementById('postExcerpt').value,
                status: document.getElementById('postStatus').value,
                category: document.getElementById('postCategory').value,
                tags: document.getElementById('postTags').value.split(',').map(t => t.trim()),
                featured_image: document.getElementById('postFeatured').value,
                featured: document.getElementById('postFeaturedFlag').checked
            };
            
            try {
                const response = await fetch('/api/posts' + (currentPostId ? \`/\${currentPostId}\` : ''), {
                    method: currentPostId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postData)
                });
                
                if (response.ok) {
                    alert('Saved successfully!');
                    if (!currentPostId) {
                        // Reset form for new post
                        window.location.href = '/admin?action=new-post';
                    }
                } else {
                    throw new Error('Failed to save');
                }
            } catch (error) {
                alert('Error saving: ' + error.message);
            }
        }
        
        // Load existing post if editing
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('edit');
        
        if (postId) {
            loadPostForEditing(postId);
        }
        
        async function loadPostForEditing(id) {
            try {
                const response = await fetch(\`/api/posts/\${id}\`);
                const post = await response.json();
                
                document.getElementById('editorTitle').textContent = 'Edit Post';
                document.getElementById('postTitle').value = post.title;
                document.getElementById('postSlug').value = post.slug;
                document.getElementById('postContent').value = post.content;
                document.getElementById('postExcerpt').value = post.excerpt || '';
                document.getElementById('postStatus').value = post.status;
                document.getElementById('postCategory').value = post.category || '';
                document.getElementById('postTags').value = post.tags ? post.tags.join(', ') : '';
                document.getElementById('postFeatured').value = post.featured_image || '';
                document.getElementById('postFeaturedFlag').checked = post.featured || false;
                
                currentPostId = id;
            } catch (error) {
                console.error('Error loading post:', error);
            }
        }
    </script>
</body>
</html>`
