import { io, type Socket } from 'socket.io-client';
import { logger } from '@/lib/logger';
import type { SocketConnectionConfig, SocketEvents } from './types';

/**
 * Service responsible for managing socket connections
 * Single Responsibility: Connection lifecycle management
 */
export class SocketConnectionService {
  private socket: Socket | null = null;

  connect(config: SocketConnectionConfig): Socket {
    if (this.socket?.connected) {
      logger.warn('Socket already connected');
      return this.socket;
    }

    logger.info('Connecting to socket server', {
      url: config.url,
    });

    this.socket = io(config.url, {
      auth: {
        token: config.accessToken,
      },
      transports: ['websocket', 'polling'],
      timeout: config.timeout || 20_000,
      reconnection: false,
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      logger.info('Disconnecting from socket server');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  emit<K extends keyof SocketEvents>(event: K, data?: any): void {
    if (!this.socket?.connected) {
      logger.warn('Cannot emit event: socket not connected', { event });
      return;
    }

    this.socket.emit(event, data);
    logger.debug('Socket event emitted', { event, data });
  }
}
