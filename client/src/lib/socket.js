import { io } from 'socket.io-client';

let socketInstance = null;
let lastAuthToken = null;

const trimTrailingSlash = (value) => value?.replace(/\/$/, '') || '';

const resolveSocketUrl = () => {
  const explicit = trimTrailingSlash(import.meta.env.VITE_SOCKET_URL);
  if (explicit) return explicit;

  const apiBase = trimTrailingSlash(import.meta.env.VITE_API_URL);
  if (!apiBase) return window.location.origin;
  return apiBase.endsWith('/v1') ? apiBase.slice(0, -3) : apiBase;
};

export const connectSocket = (token) => {
  if (!token) return null;

  if (socketInstance && lastAuthToken !== token) {
    socketInstance.disconnect();
    socketInstance = null;
  }
  lastAuthToken = token;

  if (!socketInstance) {
    socketInstance = io(resolveSocketUrl(), {
      transports: ['websocket'],
      auth: { token },
    });
  } else {
    socketInstance.auth = { token };
    if (!socketInstance.connected) {
      socketInstance.connect();
    }
  }

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (!socketInstance) return;
  socketInstance.disconnect();
  socketInstance = null;
  lastAuthToken = null;
};
