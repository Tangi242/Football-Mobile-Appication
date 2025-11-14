import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import createApp from './app.js';

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

server.listen(PORT, () => {
  console.log(`Bridge API running on http://localhost:${PORT}`);
});

