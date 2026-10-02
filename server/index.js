import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

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
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Express сервер работает!' });
});
