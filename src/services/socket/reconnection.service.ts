import type { Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@/lib/config/socket';
import { logger } from '@/lib/logger';

/**
 * Service responsible for handling socket reconnection logic
 * Single Responsibility: Reconnection and retry logic
 */
export class SocketReconnectionService {
  private reconnectAttempts = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private reconnectTimer?: NodeJS.Timeout;

  constructor(maxAttempts = 5, delay = 1000) {
    this.maxReconnectAttempts = maxAttempts;
    this.reconnectDelay = delay;
  }

  setupReconnectionHandlers(socket: Socket): void {
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      logger.info('Socket connected successfully');
      this.resetAttempts();
      this.clearReconnectTimer();
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
      logger.warn('Socket disconnected', { reason });
      // Reconnect for all reasons except intentional client disconnect
      if (reason !== 'io client disconnect') {
        this.attemptReconnection(socket);
      }
    });

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      logger.error('Socket connection error', error);
      this.attemptReconnection(socket);
    });
  }

  private attemptReconnection(socket: Socket): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * 2 ** (this.reconnectAttempts - 1);

    logger.info('Attempting to reconnect', {
      attempt: this.reconnectAttempts,
      delay,
    });

    // Clear any existing timer to prevent multiple concurrent reconnections
    this.clearReconnectTimer();

    this.reconnectTimer = setTimeout(() => {
      socket.connect();
    }, delay);
  }

  resetAttempts(): void {
    this.reconnectAttempts = 0;
  }

  clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  getAttempts(): number {
    return this.reconnectAttempts;
  }
}
