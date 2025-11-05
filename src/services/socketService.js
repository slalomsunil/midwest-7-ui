import { io } from 'socket.io-client';
import { API_BASE_URL } from '../utils/apiConfig';

const socket = io(API_BASE_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export default socket;
