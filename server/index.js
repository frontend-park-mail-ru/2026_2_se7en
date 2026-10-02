import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/src', express.static(path.join(__dirname, '../src')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
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
    res.cookie(`sessio_id`, `mock-session-id`, {
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
