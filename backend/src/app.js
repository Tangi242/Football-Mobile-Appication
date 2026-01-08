import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fixturesRoute from './routes/fixtures.js';
import resultsRoute from './routes/results.js';
import reportsRoute from './routes/reports.js';
import usersRoute from './routes/users.js';
import authRoute from './routes/auth.js';
import announcementsRoute from './routes/announcements.js';
import productsRoute from './routes/products.js';
import teamsRoute from './routes/teams.js';
import coachesRoute from './routes/coaches.js';
import leaguesRoute from './routes/leagues.js';
import stadiumsRoute from './routes/stadiums.js';
import newsRoute from './routes/news.js';
import ticketsRoute from './routes/tickets.js';
import webhooksRoute from './routes/webhooks.js';
import metaRoute from './routes/meta.js';
import playersRoute from './routes/players.js';
import aiNewsRoute from './routes/aiNews.js';
import coachRoute from './routes/coach.js';
import standingsRoute from './routes/standings.js';
import pollsRoute from './routes/polls.js';
import quizzesRoute from './routes/quizzes.js';
import interviewsRoute from './routes/interviews.js';
import commentsRoute from './routes/comments.js';
import matchEventsRoute from './routes/matchEvents.js';
import playerRatingsRoute from './routes/playerRatings.js';
import transfersRoute from './routes/transfers.js';
import friendlyFixturesRoute from './routes/friendlyFixtures.js';
import trainingRoute from './routes/training.js';
import playerStatsRoute from './routes/playerStats.js';
import uploadRoute from './routes/upload.js';
import registrationsRoute from './routes/registrations.js';

const createApp = ({ broadcast }) => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.ALLOW_ORIGIN?.split(',') || '*' }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(morgan('combined'));
  
  // Serve uploaded files statically
  app.use('/uploads', express.static('uploads'));

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
  app.use('/api/auth', authRoute);
  app.use('/api/announcements', announcementsRoute);
  app.use('/api/products', productsRoute);
  app.use('/api/teams', teamsRoute);
  app.use('/api/coaches', coachesRoute);
  app.use('/api/leagues', leaguesRoute);
  app.use('/api/stadiums', stadiumsRoute);
  app.use('/api/news', newsRoute);
  app.use('/api/tickets', ticketsRoute);
  app.use('/api/meta', metaRoute);
  app.use('/api/players', playersRoute);
  app.use('/api/coach', coachRoute);
  app.use('/api/standings', standingsRoute);
  app.use('/api/polls', pollsRoute);
  app.use('/api/quizzes', quizzesRoute);
  app.use('/api/interviews', interviewsRoute);
  app.use('/api/comments', commentsRoute);
  app.use('/api/matches', matchEventsRoute);
  app.use('/api/matches', playerRatingsRoute);
  app.use('/api/transfers', transfersRoute);
  app.use('/api/friendly-fixtures', friendlyFixturesRoute);
  app.use('/api/training', trainingRoute);
  app.use('/api', playerStatsRoute);
  app.use('/api/webhooks', webhooksRoute);
  app.use('/api/ai-news', aiNewsRoute);
  app.use('/api/upload', uploadRoute);
  app.use('/api/registrations', registrationsRoute);

  // error handler
  app.use((err, _req, res, _next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
  });

  return app;
};

export default createApp;

