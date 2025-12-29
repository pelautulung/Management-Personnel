// Minimal static file server for Node when no external http-server installed
const http = require('http');
const fs = require('fs');
const path = require('path');

const port = parseInt(process.argv[2] || process.env.PORT || '5500', 10);
const root = process.cwd();

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(root, reqPath);
  fs.stat(filePath, (err, stats) => {
    if (err) return send404(res);
    if (stats.isDirectory()) return send404(res);
    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(port, () => console.log('Simple server running on http://127.0.0.1:' + port));

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
}
