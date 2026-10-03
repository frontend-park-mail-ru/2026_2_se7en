import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use('/src', express.static(path.join(__dirname, '../src')));
app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (req, res) => {
  const templatePath = path.join(__dirname, '../index.html');
  let html = fs.readFileSync(templatePath, 'utf-8');
  html = html.replace('{{BACKEND_URL}}', process.env.BACKEND_URL);
  res.type('html').send(html);
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Express сервер работает!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
