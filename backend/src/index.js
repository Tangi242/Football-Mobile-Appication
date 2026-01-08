import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import createApp from './app.js';
import { startNewsScheduler } from './services/newsScheduler.js';
import pool from './config/db.js';

dotenv.config({ path: process.env.ENV_FILE || '.env' });

const PORT = process.env.PORT || 4000;

const sockets = new Set();

const broadcast = (event, data) => {
  sockets.forEach((socket) => socket.emit(event, data));
};

const app = createApp({ broadcast });
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOW_ORIGIN?.split(',') || '*'
  }
});

io.on('connection', (socket) => {
  sockets.add(socket);
  console.log('Client connected', socket.id);
  socket.on('disconnect', () => {
    sockets.delete(socket);
    console.log('Client disconnected', socket.id);
  });
});

server.listen(PORT, async () => {
  console.log(`Bridge API running on http://localhost:${PORT}`);
  
  // Test database connection
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('MySQL Database connected successfully');
    console.log(`   Database: ${process.env.DB_NAME || 'football'}`);
    console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`   User: ${process.env.DB_USER || 'root'}`);
  } catch (error) {
    console.error('MySQL Database connection failed:', error.message);
    console.error('   Please check your database credentials');
  }
  
  // Start AI News Generator
  if (process.env.ENABLE_AI_NEWS !== 'false') {
    startNewsScheduler();
  } else {
    console.log('AI News Generator is disabled (ENABLE_AI_NEWS=false)');
  }
});

