/* Local server for TolKanta: serves the website and the AI chat function.
   Usage (Node 18+, no npm install needed):
     GEMINI_API_KEY=AIza... node server.js        (macOS / Linux)
     set GEMINI_API_KEY=AIza... && node server.js (Windows cmd)
   Then open http://localhost:3000                                        */
const http = require('http'), fs = require('fs'), path = require('path');
const chat = require('./api/chat.js');
const ROOT = __dirname, PORT = Number(process.env.PORT) || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.md': 'text/plain; charset=utf-8' };

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/chat') {
    let raw = '';
    req.on('data', (c) => { raw += c; if (raw.length > 200000) req.destroy(); });
    req.on('end', () => { try { req.body = raw ? JSON.parse(raw) : null; } catch (e) { req.body = null; } chat(req, res); });
    return;
  }
  let p = path.normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
  if (!p || p.endsWith('/') || p.endsWith('\\')) p += 'index.html';
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || /(^|[/\\])(api|node_modules)[/\\]|server\.js$|\.env/.test(p)) { res.statusCode = 404; return res.end('Not found'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.statusCode = 404; return res.end('Not found'); }
    res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.end(buf);
  });
}).listen(PORT, () => console.log('TolKanta running at http://localhost:' + PORT + (process.env.GEMINI_API_KEY ? '  (AI assistant ON)' : '  (AI assistant OFF: set GEMINI_API_KEY)')));
