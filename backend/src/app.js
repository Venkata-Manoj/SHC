import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB, getConnectionStatus } from './config/db.js';
import authRoutes from './routes/auth.js';
import hackathonRoutes from './routes/hackathons.js';
import submissionRoutes from './routes/submissions.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';
import feedbackRoutes from './routes/feedback.js';
import { startLinkChecker } from './services/linkChecker.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: getConnectionStatus() ? 'connected' : 'disconnected', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

async function start() {
  await connectDB();
  startLinkChecker();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
