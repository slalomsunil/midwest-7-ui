import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});

export default socket;
