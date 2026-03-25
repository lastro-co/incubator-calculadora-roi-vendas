/**
 * Socket event constants
 * Define your socket events here to avoid magic strings
 */
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',

  // Add your domain-specific events below:
  // MESSAGE_NEW: 'message:new',
  // MESSAGE_UPDATED: 'message:updated',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
