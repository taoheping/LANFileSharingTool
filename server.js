const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const os = require('os');

// 配置
const config = {
    port: 8080,
    sharedDir: path.join(__dirname, 'shared'), // 改这里
    enableAuth: true,  // 身份验证
    username: 'admin',
    password: 'admin123'
};

// 确保共享目录存在
if (!fs.existsSync(config.sharedDir)) {
    fs.mkdirSync(config.sharedDir, { recursive: true });
    console.log(`创建共享目录: ${config.sharedDir}`);
}

// 获取本地IP地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

// MIME类型映射
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.zip': 'application/zip',
    '.txt': 'text/plain',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg'
};

// 获取MIME类型
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return mimeTypes[ext] || 'application/octet-stream';
}

// 读取静态文件
function readStaticFile(filename) {
    const filePath = path.join(__dirname, filename);
    try {
        return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
        console.error('Error reading static file:', error);
        return '';
    }
}

// 生成文件列表页面
function generateFilesPage(dir, relativePath = '') {
    // 读取HTML模板
    let html = readStaticFile('files.html');
    
    // 检查是否成功读取文件
    if (!html) {
        console.error('Failed to read files.html template');
        return '<html><body><h1>Error: Failed to load page template</h1></body></html>';
    }
    
    // 替换模板变量
    html = html.replace(/\{\{pageTitle\}\}/g, relativePath ? relativePath : '根目录');
    html = html.replace(/\{\{breadcrumb\}\}/g, relativePath ? relativePath : '根目录');
    
    // 添加时间戳变量防止浏览器缓存CSS和JS文件
    const timestamp = Date.now();
    html = html.replace(/\{\{timestamp\}\}/g, timestamp);
    
    // 返回根目录按钮 - 根据当前路径生成
    if (relativePath) {
        const backLinkHtml = `<a href="/files" class="back-link" aria-label="返回根目录">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12L9 6M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            返回根目录
        </a>`;
        html = html.replace(/\{\{backLink\}\}/g, backLinkHtml);
    } else {
        html = html.replace(/\{\{backLink\}\}/g, '');
    }
    
    // 生成文件列表内容
    let fileListContent = generateFileListContent(dir, relativePath);
    html = html.replace(/\{\{fileList\}\}/g, fileListContent);

    return html;
}

// 生成上传页面
function generateUploadPage() {
    let html = readStaticFile('upload.html');
    
    if (!html) {
        console.error('Failed to read upload.html template');
        return '<html><body><h1>Error: Failed to load page template</h1></body></html>';
    }
    
    const timestamp = Date.now();
    html = html.replace(/\{\{timestamp\}\}/g, timestamp);
    
    return html;
}

// 生成登录页面
function generateLoginPage() {
    let html = readStaticFile('login.html');
    
    if (!html) {
        console.error('Failed to read login.html template');
        return '<html><body><h1>Error: Failed to load page template</h1></body></html>';
    }
    
    const timestamp = Date.now();
    html = html.replace(/\{\{timestamp\}\}/g, timestamp);
    
    return html;
}

// 生成文件列表内容
function generateFileListContent(dir, relativePath = '') {
    let html = '';
    
    // 添加父目录链接（如果不是根目录）
    if (relativePath) {
        html += `
            <a href="/files/${relativePath.split('/').slice(0, -1).join('/')}" style="text-decoration: none; color: inherit;">
                <div class="file-item">
                    <div class="file-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                    <div class="file-info">
                        <div class="file-name">返回上级目录</div>
                    </div>
                </div>
            </a>
        `;
    }
    
    try {
        const items = fs.readdirSync(dir);
        
        // 先添加文件夹
        items.filter(item => {
            const itemPath = path.join(dir, item);
            return fs.statSync(itemPath).isDirectory();
        }).sort().forEach(item => {
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);
            const modifiedTime = new Date(stats.mtime).toLocaleString();
            const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
            
            html += `
                <a href="/files/${itemRelativePath}" style="text-decoration: none; color: inherit;">
                    <div class="file-item">
                        <div class="file-icon" style="background-color: #f0f4ff;">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 7H20C20.5304 7 21.0391 7.21071 21.4142 7.58579C21.7893 7.96086 22 8.46957 22 9V19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <div class="file-info">
                            <div class="file-name">${item}</div>
                            <div class="file-meta">文件夹 · ${modifiedTime}</div>
                        </div>
                    </div>
                </a>
            `;
        });
        
        // 然后添加文件
        items.filter(item => {
            const itemPath = path.join(dir, item);
            return fs.statSync(itemPath).isFile();
        }).sort().forEach(item => {
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);
            const fileSize = stats.size;
            const modifiedTime = new Date(stats.mtime).toLocaleString();
            let fileSizeStr = '';
            
            if (fileSize < 1024) {
                fileSizeStr = `${fileSize} B`;
            } else if (fileSize < 1024 * 1024) {
                fileSizeStr = `${(fileSize / 1024).toFixed(1)} KB`;
            } else if (fileSize < 1024 * 1024 * 1024) {
                fileSizeStr = `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
            } else {
                fileSizeStr = `${(fileSize / (1024 * 1024 * 1024)).toFixed(1)} GB`;
            }
            
            const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
            const iconColor = getFileIconColor(item);
            
            html += `
                <div class="file-item" data-filename="${item}">
                    <div class="file-icon" style="background-color: ${iconColor};">
                        ${getFileIcon(item)}
                    </div>
                    <div class="file-info">
                        <div class="file-name">${item}</div>
                        <div class="file-meta">${modifiedTime}</div>
                    </div>
                    <div class="file-size">${fileSizeStr}</div>
                    <a href="/download/${itemRelativePath}" class="download-icon" onclick="event.stopPropagation();" title="下载文件">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>
            `;
        });
    } catch (error) {
        html += `<div class="file-item"><div class="file-info"><div class="file-name">无法读取目录: ${error.message}</div></div></div>`;
    }
    
    return html;
}

// 获取文件图标
function getFileIcon(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    if (ext === '.pdf') {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12H8V14H10V12Z" fill="currentColor"/><path d="M16 12H8V14H16V12Z" fill="currentColor"/><path d="M10 16H8V18H10V16Z" fill="currentColor"/><path d="M16 16H8V18H16V16Z" fill="currentColor"/></svg>';
    } else if (ext === '.zip' || ext === '.rar' || ext === '.7z') {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V6L16 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 2V6H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12H8V16H10V12Z" fill="currentColor"/><path d="M14 12H12V16H14V12Z" fill="currentColor"/></svg>';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.bmp', '.webp'].includes(ext)) {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><polyline points="21 15 16 10 5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else if (['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(ext)) {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="23 7 16 12 23 17 23 7" fill="currentColor"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/></svg>';
    } else if (['.mp3', '.wav', '.ogg', '.flac'].includes(ext)) {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" fill="currentColor"/><circle cx="18" cy="16" r="3" fill="currentColor"/></svg>';
    } else if (['.doc', '.docx', '.txt', '.rtf'].includes(ext)) {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/><line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/><polyline points="10 9 9 9 8 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    } else {
        return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 2V8H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
}

// 获取文件图标颜色
function getFileIconColor(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    if (ext === '.pdf') {
        return '#ffebeb';
    } else if (ext === '.zip' || ext === '.rar' || ext === '.7z') {
        return '#fff3e0';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.bmp', '.webp'].includes(ext)) {
        return '#e3f2fd';
    } else if (['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(ext)) {
        return '#fce4ec';
    } else if (['.mp3', '.wav', '.ogg', '.flac'].includes(ext)) {
        return '#f1f8e9';
    } else if (['.doc', '.docx', '.txt', '.rtf'].includes(ext)) {
        return '#e8f5e9';
    } else {
        return '#f5f5f5';
    }
}

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    // 启用CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    // 解析URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);
    
    // API路由
    if (pathname.startsWith('/api')) {
        if (pathname === '/api' && req.method === 'POST') {
            try {
                const body = [];
                req.on('data', chunk => {
                    body.push(chunk);
                });
                
                req.on('end', () => {
                    try {
                        const data = JSON.parse(Buffer.concat(body).toString());
                        
                        if (data.code === 'get_ip') {
                            const ip = getLocalIP();
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ ip, success: true }));
                        } else {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Invalid code', success: false }));
                        }
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid JSON', success: false }));
                    }
                });
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error', success: false }));
            }
        } else if (pathname === '/api/login' && req.method === 'POST') {
            // 登录API
            try {
                const body = [];
                req.on('data', chunk => {
                    body.push(chunk);
                });
                
                req.on('end', () => {
                    try {
                        const data = JSON.parse(Buffer.concat(body).toString());
                        const { username, password } = data;
                        
                        // 验证用户名和密码
                        if (config.enableAuth && 
                            username === config.username && 
                            password === config.password) {
                            // 登录成功
                            console.log(`用户登录成功: ${username}`);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: '登录成功' }));
                        } else if (!config.enableAuth) {
                            // 未启用身份验证
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: '未启用身份验证' }));
                        } else {
                            // 登录失败
                            console.log(`用户登录失败: ${username}`);
                            res.writeHead(401, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: '用户名或密码错误' }));
                        }
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Invalid JSON', success: false }));
                    }
                });
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error', success: false }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API endpoint not found', success: false }));
        }
        return;
    }
    
    // 文件下载路由
    if (pathname.startsWith('/download/')) {
        const filePath = decodeURIComponent(pathname.substring(10)); // 去除 '/download/' 前缀
        const fullPath = path.join(config.sharedDir, filePath);
        
        // 确保文件路径在共享目录内
        if (!fullPath.startsWith(config.sharedDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Access denied');
            return;
        }
        
        fs.stat(fullPath, (err, stats) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }
            
            if (stats.isDirectory()) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Cannot download a directory');
                return;
            }
            
            const stream = fs.createReadStream(fullPath);
            res.writeHead(200, {
                'Content-Type': getContentType(fullPath),
                'Content-Disposition': `attachment; filename="${encodeURIComponent(path.basename(fullPath))}"`,
                'Content-Length': stats.size
            });
            
            stream.on('error', (error) => {
                console.error('Stream error:', error);
                res.end();
            });
            
            stream.pipe(res);
        });
        return;
    }
    
    // 文件上传路由
    if (pathname.startsWith('/upload/') && req.method === 'POST') {
        const dirPath = decodeURIComponent(pathname.substring(8)); // 去除 '/upload/' 前缀
        const fullDirPath = dirPath ? path.join(config.sharedDir, dirPath) : config.sharedDir;
        
        // 确保目录路径在共享目录内
        if (!fullDirPath.startsWith(config.sharedDir)) {
            res.writeHead(403, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Access denied' }));
            return;
        }
        
        // 确保目录存在
        if (!fs.existsSync(fullDirPath)) {
            fs.mkdirSync(fullDirPath, { recursive: true });
        }
        
        // 处理multipart/form-data
        let body = '';
        let boundary = '';
        const contentType = req.headers['content-type'];
        
        if (contentType && contentType.includes('multipart/form-data')) {
            const boundaryMatch = contentType.match(/boundary=([^;]+)/);
            if (boundaryMatch) {
                boundary = '--' + boundaryMatch[1];
            }
        }
        
        if (!boundary) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid content type' }));
            return;
        }
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const parts = body.split(boundary);
                let fileFound = false;
                
                for (const part of parts) {
                    if (part.includes('Content-Disposition: form-data') && part.includes('filename=')) {
                        const filenameMatch = part.match(/filename="([^"]+)"/);
                        if (filenameMatch) {
                            const filename = filenameMatch[1];
                            if (filename) {
                                const fileData = part.split('\r\n\r\n')[1].split('\r\n' + boundary)[0];
                                const filePath = path.join(fullDirPath, filename);
                                
                                fs.writeFileSync(filePath, fileData, 'binary');
                                fileFound = true;
                                console.log(`File uploaded: ${filePath}`);
                                break;
                            }
                        }
                    }
                }
                
                if (fileFound) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'No file found in request' }));
                }
            } catch (error) {
                console.error('Upload error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Upload failed' }));
            }
        });
        return;
    }
    
    // 文件列表路由
    if (pathname.startsWith('/files/')) {
        const filePath = decodeURIComponent(pathname.substring(7)); // 去除 '/files/' 前缀
        const fullPath = path.join(config.sharedDir, filePath);
        
        // 确保路径在共享目录内
        if (!fullPath.startsWith(config.sharedDir)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Access denied');
            return;
        }
        
        fs.stat(fullPath, (err, stats) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Directory not found');
                return;
            }
            
            if (stats.isDirectory()) {
                const html = generateFilesPage(fullPath, filePath);
                const etag = `"${Date.now()}"`; // 每次请求都生成新的 ETag
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'ETag': etag
                });
                res.end(html);
            } else {
                // 如果是文件，则重定向到下载
                res.writeHead(302, { 'Location': `/download/${filePath}` });
                res.end();
            }
        });
        return;
    }
    
    // 登录页面
    if (pathname === '/login') {
        if (!config.enableAuth) {
            // 如果未启用身份验证，直接跳转到文件列表
            res.writeHead(302, { 'Location': '/files' });
            res.end();
            return;
        }
        
        const html = generateLoginPage();
        const etag = `"${Date.now()}"`;
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'ETag': etag
        });
        res.end(html);
        return;
    }
    
    // 上传页面
    if (pathname === '/upload') {
        if (config.enableAuth) {
            // 需要身份验证（前端会检查localStorage）
        }
        
        const html = generateUploadPage();
        const etag = `"${Date.now()}"`;
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'ETag': etag
        });
        res.end(html);
        return;
    }
    
    // 文件列表页面
    if (pathname === '/files') {
        const html = generateFilesPage(config.sharedDir);
        const etag = `"${Date.now()}"`;
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'ETag': etag
        });
        res.end(html);
        return;
    }
    
    // 根目录 - 重定向到文件列表
    if (pathname === '/') {
        res.writeHead(302, { 'Location': '/files' });
        res.end();
        return;
    }
    
    // 静态文件服务 (用于前端资源)
    if (pathname.startsWith('/static/')) {
        const staticPath = path.join(__dirname, pathname.substring(8)); // 去除 '/static/' 前缀

        // 确保请求的文件在项目目录内
        if (!staticPath.startsWith(__dirname)) {
            res.writeHead(403, { 'Content-Type': 'text/plain' });
            res.end('Access denied');
            return;
        }

        fs.readFile(staticPath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                return;
            }

            // 为 CSS 和 JS 文件添加版本号防止缓存
            const ext = path.extname(staticPath).toLowerCase();
            let headers = {
                'Content-Type': getContentType(staticPath)
            };

            // HTML 和 CSS 文件不缓存
            if (ext === '.html' || ext === '.css') {
                headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
                headers['Pragma'] = 'no-cache';
                headers['Expires'] = '0';
            }

            // JS 文件也不缓存
            if (ext === '.js') {
                headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
                headers['Pragma'] = 'no-cache';
                headers['Expires'] = '0';
            }

            res.writeHead(200, headers);
            res.end(data);
        });
        return;
    }
});

// 启动服务器
server.listen(config.port, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log(`\n=== 局域网文件共享服务器启动成功 ===`);
    console.log(`本地访问地址: http://localhost:${config.port}`);
    console.log(`局域网访问地址: http://${localIP}:${config.port}`);
    console.log(`共享目录: ${config.sharedDir}`);
    console.log(`身份验证: ${config.enableAuth ? '启用' : '禁用'}`);
    if (config.enableAuth) {
        console.log(`用户名: ${config.username}`);
        console.log(`密码: ${config.password}`);
    }
    console.log(`=======================================\n`);
     console.log(`广告：需要云服务器，开发，游戏开服，等等服务，可以联系我。`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n服务器正在关闭...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});