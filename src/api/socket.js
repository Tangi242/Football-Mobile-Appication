import { io } from 'socket.io-client';
import { WS_URL } from '../config/constants.js';

let socket;

export const initSocket = () => {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ['websocket'],
      autoConnect: true
    });
  }
  return socket;
};

export const getSocket = () => socket;

