import type { Socket } from 'socket.io-client';
import type { SocketCacheService } from './cache.service';

/**
 * Service responsible for setting up and managing socket event handlers.
 * Single Responsibility: Event handler registration and delegation.
 *
 * Extend this class to register domain-specific event handlers. Example:
 *
 * ```ts
 * private setupMessageHandlers(socket: Socket): void {
 *   socket.on(SOCKET_EVENTS.MESSAGE_NEW, (data) => {
 *     this.cacheService.handleNewMessage(data.message, data.chatId);
 *   });
 * }
 * ```
 */
export class SocketEventHandlersService {
  protected cacheService: SocketCacheService;

  constructor(cacheService: SocketCacheService) {
    this.cacheService = cacheService;
  }

  /**
   * Set up all event handlers on the socket.
   * Override this method to register your domain-specific handlers.
   */
  setupEventHandlers(_socket: Socket): void {
    // Register your domain-specific event handlers here.
    // Example:
    //   this.setupMessageHandlers(socket);
    //   this.setupPresenceHandlers(socket);
  }
}
