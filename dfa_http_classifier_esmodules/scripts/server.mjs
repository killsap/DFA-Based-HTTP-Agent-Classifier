#!/usr/bin/env node
import http from 'http';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const LOGDIR = path.join(ROOT, 'logs');
await mkdir(LOGDIR, { recursive: true });

const PORT = process.env.PORT || 8080;

function mime(ext) {
  return { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json' }[ext] || 'application/octet-stream';
}

function send(res, code, data='', type='text/plain', extraHeaders={}) {
  res.writeHead(code, { 'Content-Type': type, ...extraHeaders });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  // CORS pre-flight for /log
  if (req.method === 'OPTIONS' && req.url === '/log') {
    return send(res, 204, '', 'text/plain', {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
  }

  // Logging endpoint
  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const entry = JSON.parse(body || '{}');
        const file = path.join(LOGDIR, 'buttonInteractions.json');
        let arr = [];
        try { arr = JSON.parse(await readFile(file, 'utf8')); } catch {}
        arr.push({ ...entry, ts: Date.now() });
        await writeFile(file, JSON.stringify(arr, null, 2));
        send(res, 204, '', 'text/plain', { 'Access-Control-Allow-Origin': '*' });
      } catch(err) {
        console.error(err);
        send(res, 400, 'bad json', 'text/plain', { 'Access-Control-Allow-Origin': '*' });
      }
    });
    return;
  }

  // Static file handler
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.normalize(path.join(PUBLIC, urlPath));
  if (!filePath.startsWith(PUBLIC)) return send(res, 403, 'Forbidden');
  try {
    const data = await readFile(filePath);
    send(res, 200, data, mime(path.extname(filePath)));
  } catch {
    send(res, 404, 'Not found');
  }
});

server.listen(PORT, () => console.log(`Dev server running at http://localhost:${PORT}`));