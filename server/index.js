import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

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
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Express сервер работает!' });
});

app.post('/api/v1/auth/register', (req, res) => {
  const { email, password, nickname } = req.body;
  if (!email || !password || !nickname) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Некорректные данные' });
  }

  res.cookie('session_id', 'mock-session-token-123', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 2592000000,
  });

  res.status(201).json({
    id: 'user-1',
    email,
    profile: {
      id: 'prof-1',
      nickname,
      first_name: null,
      last_name: null,
      bio: null,
      icon_url: null,
    },
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (email === 'test@test.com' && password === '12345678') {
    res.cookie('session_id', 'mock-session-token-123', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 2592000000,
    });
    return res.status(200).json({
      id: 'user-1',
      email,
      profile: {
        id: 'prof-1',
        nickname: 'TestUser',
        first_name: 'Иван',
        last_name: 'Иванов',
        bio: 'Привет!',
        icon_url: null,
      },
    });
  }

  res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль' });
});

app.get('/api/v1/auth/me', (req, res) => {
  const session = req.cookies?.session_id;

  if (!session || session !== 'mock-session-token-123') {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Сессия недействительна' });
  }

  res.json({
    id: 'user-1',
    email: 'test@test.com',
    profile: {
      id: 'prof-1',
      nickname: 'TestUser',
      first_name: 'Иван',
      last_name: 'Иванов',
      bio: 'Привет!',
      icon_url: null,
    },
  });
});

app.post('/api/v1/auth/logout', (req, res) => {
  res.clearCookie('session_id');
  res.status(204).send();
});

app.get('/api/v1/chats', (req, res) => {
  const session = req.cookies?.session_id;
  if (!session || session !== 'mock-session-token-123') {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Сессия недействительна' });
  }

  const { limit = 20, offset = 0 } = req.query;

  const mockChats = [
    {
      id: 'chat-1',
      type: 'dialog',
      name: null,
      description: null,
      icon_url: 'https://via.placeholder.com/50',
      members_count: 2,
      role: 'member',
      last_message: {
        id: 'msg-1',
        content: 'Привет, как дела?',
        type: 'text',
        created_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    },
    {
      id: 'chat-2',
      type: 'group',
      name: 'Рабочий чат',
      description: 'Чат для рабочих вопросов',
      icon_url: 'https://via.placeholder.com/50/0000FF',
      members_count: 15,
      role: 'admin',
      last_message: {
        id: 'msg-2',
        content: 'Встреча в 15:00',
        type: 'text',
        created_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    },
  ];

  const items = mockChats.slice(offset, offset + parseInt(limit));

  res.json({ items });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Тестовый логин: test@test.com / 12345678`);
});
