import type { QueryClient } from '@tanstack/react-query';
import { env } from '@/lib/env';
import { SocketCacheService } from './cache.service';
import { SocketConnectionService } from './connection.service';
import { SocketEventHandlersService } from './event-handlers.service';
import { SocketReconnectionService } from './reconnection.service';
import type { SocketConnectionConfig, SocketEvents } from './types';

/**
 * Main socket service that orchestrates all socket-related functionality.
 * Single Responsibility: Service composition and public API.
 *
 * Usage:
 * ```ts
 * import { socketService } from '@/services/socket';
 *
 * // Connect with auth token and query client
 * socketService.connect(accessToken, queryClient);
 *
 * // Emit events
 * socketService.emit('my:event', { data: 'value' });
 *
 * // Disconnect
 * socketService.disconnect();
 * ```
 */
class SocketService {
  private connectionService = new SocketConnectionService();
  private reconnectionService = new SocketReconnectionService();
  private cacheService: SocketCacheService | null = null;
  private eventHandlersService: SocketEventHandlersService | null = null;

  /**
   * Initialize socket connection with all services
   */
  connect(accessToken: string, queryClient: QueryClient): void {
    const config: SocketConnectionConfig = {
      url: env.NEXT_PUBLIC_SOCKET_URL || '',
      accessToken,
      timeout: 20_000,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    };

    // Initialize services that depend on queryClient
    this.cacheService = new SocketCacheService(queryClient);
    this.eventHandlersService = new SocketEventHandlersService(
      this.cacheService
    );

    // Connect to socket
    const socket = this.connectionService.connect(config);

    // Setup reconnection handlers
    this.reconnectionService.setupReconnectionHandlers(socket);

    // Setup event handlers
    this.eventHandlersService.setupEventHandlers(socket);
  }

  /**
   * Disconnect from socket server and cleanup
   */
  disconnect(): void {
    this.connectionService.disconnect();
    this.reconnectionService.resetAttempts();
    this.cacheService = null;
    this.eventHandlersService = null;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.connectionService.isConnected();
  }

  /**
   * Emit an event to the server
   */
  emit<K extends keyof SocketEvents>(event: K, data?: any): void {
    this.connectionService.emit(event, data);
  }
}

export const socketService = new SocketService();
