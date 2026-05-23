import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB, getConnectionStatus } from './config/db.js';
import { getJwtSecret } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import hackathonRoutes from './routes/hackathons.js';
import submissionRoutes from './routes/submissions.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';
import feedbackRoutes from './routes/feedback.js';
import notificationRoutes from './routes/notifications.js';
import { startLinkChecker } from './services/linkChecker.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

const corsOrigin = process.env.CORS_ORIGIN;
if (corsOrigin) {
  app.use(cors({ origin: corsOrigin, credentials: true }));
} else {
  app.use(cors({ origin: '*' }));
}

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve('uploads')));

app.use((req, res, next) => {
  if (req.method === 'GET') {
    if (req.path.startsWith('/api/hackathons') && !req.headers.authorization) {
      res.set('Cache-Control', 'public, max-age=60, s-maxage=300');
    } else {
      res.set('Cache-Control', 'no-store');
    }
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: getConnectionStatus() ? 'connected' : 'disconnected', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason instanceof Error ? reason.stack : reason);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.stack);
  process.exitCode = 1;
});

export default app;

async function start() {
  try {
    getJwtSecret();
  } catch (err) {
    console.error(`FATAL: ${err.message}`);
    process.exit(1);
  }
  await connectDB();
  startLinkChecker();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.NODE_ENV?.startsWith('test')) {
  start();
}
