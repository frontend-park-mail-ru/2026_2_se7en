import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }),
);

app.use(express.json());

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

/* eslint-disable no-console */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === `1@1.ru` && password === `228228228`) {
    res.cookie(`session_id`, `mock-session-id`, {
      httpOnly: true,
      sameSite: `lax`,
      maxAge: 30 * 24 * 1000,
    });

    return res.status(200).json({
      id: `1`,
      email,
      phoneNumber: null,
      profile: {
        id: `2`,
        nickname: `nick`,
        firstName: null,
        lastName: null,
        bio: null,
        iconUrl: null,
      },
    });
  }

  return res.status(401).json({
    code: `INVALID_CREDENTIALS`,
    message: `Неверный email или пароль`,
  });
});
