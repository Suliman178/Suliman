import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import usageRoutes from './routes/usageRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { hasDatabase, pool } from './db/db.js';

const app = express();
const port = Number(process.env.PORT || 3001);
const PgSession = connectPgSimple(session);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '4mb' }));
app.use(session({
  name: 'ai_builder.sid',
  secret: process.env.SESSION_SECRET || 'dev-only-change-me',
  resave: false,
  saveUninitialized: false,
  store: pool ? new PgSession({ pool, createTableIfMissing: true }) : undefined,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 14 }
}));
app.get('/api/health', (_req, res) => res.json({ ok: true, openaiConfigured: Boolean(process.env.OPENAI_API_KEY), databaseConfigured: hasDatabase }));
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/files', fileRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/usage', usageRoutes);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../client');
app.use(express.static(clientDist));
app.get(/.*/, (_req, res, next) => { if (process.env.NODE_ENV === 'production') res.sendFile(path.join(clientDist, 'index.html')); else next(); });
app.use(errorMiddleware);
app.listen(port, '0.0.0.0', () => console.log(`AI App Builder API server running on ${port}; database=${hasDatabase ? 'postgres' : 'memory'}`));
