/**
 * Socket event map for type-safe event handling.
 *
 * Add your domain-specific events here following the pattern:
 *   'domain:action': (payload) => void;
 *
 * Example:
 *   'message:new': (data: { message: Message; chatId: string }) => void;
 *   'chat:updated': (chat: Chat) => void;
 */
export interface SocketEvents {
  // System events
  connect: () => void;
  disconnect: (reason: string) => void;
  error: (error: Error) => void;
}

export interface SocketConnectionConfig {
  url: string;
  accessToken: string;
  timeout?: number;
  reconnectionDelay?: number;
  reconnectionAttempts?: number;
}
