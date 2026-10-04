import 'dotenv/config';
import express from 'express';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3001;
const backendUrl = new URL(process.env.BACKEND_URL || 'http://127.0.0.1:8000');

if (!['http:', 'https:'].includes(backendUrl.protocol)) {
  throw new Error('BACKEND_URL must use http or https');
}

app.set('trust proxy', 'loopback');

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

function proxyHeaders(headers) {
  return Object.fromEntries(
    Object.entries(headers).filter(([name]) => !hopByHopHeaders.has(name) && name !== 'host'),
  );
}

app.use('/api/v1', (req, res) => {
  const url = new URL(req.originalUrl, backendUrl);
  const transport = url.protocol === 'https:' ? https : http;
  const upstream = transport.request(url, {
    method: req.method,
    headers: proxyHeaders(req.headers),
  });

  upstream.on('response', (response) => {
    const headers = proxyHeaders(response.headers);

    if (!req.secure && headers['set-cookie']) {
      headers['set-cookie'] = headers['set-cookie'].map((cookie) =>
        cookie.replace(/;\s*Secure(?=;|$)/gi, ''),
      );
    }

    res.writeHead(response.statusCode || 502, headers);
    response.pipe(res);
  });

  upstream.on('error', () => {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    res.status(502).json({ code: 'BAD_GATEWAY', message: 'Бэкенд недоступен' });
  });

  req.pipe(upstream);
});

app.use('/src', express.static(path.join(__dirname, '../src')));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/templates', express.static(path.join(__dirname, '../src/templates')));
app.get(/^\/(login|register|chats)?\/?$/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Express сервер работает!' });
});

app.listen(port);
