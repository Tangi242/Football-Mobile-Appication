import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fixturesRoute from './routes/fixtures.js';
import resultsRoute from './routes/results.js';
import reportsRoute from './routes/reports.js';
import usersRoute from './routes/users.js';
import announcementsRoute from './routes/announcements.js';
import webhooksRoute from './routes/webhooks.js';
import metaRoute from './routes/meta.js';

const createApp = ({ broadcast }) => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOW_ORIGIN?.split(',') || '*' }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('combined'));

  // share broadcast helper with routes
  app.use((req, _res, next) => {
    req.broadcast = broadcast;
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/fixtures', fixturesRoute);
  app.use('/api/results', resultsRoute);
  app.use('/api/reports', reportsRoute);
  app.use('/api/users', usersRoute);
  app.use('/api/announcements', announcementsRoute);
  app.use('/api/meta', metaRoute);
  app.use('/api/webhooks', webhooksRoute);

  // error handler
  app.use((err, _req, res, _next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  });

  return app;
};

export default createApp;

