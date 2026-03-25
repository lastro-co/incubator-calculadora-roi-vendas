import type { QueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/logger';

/**
 * Service responsible for managing React Query cache updates from socket events.
 * Single Responsibility: Cache synchronization with socket events.
 *
 * Extend this class to add domain-specific cache handlers. Example:
 *
 * ```ts
 * handleNewMessage(message: Message, chatId: string): void {
 *   this.queryClient.setQueryData(
 *     queryKeys.chat.messagesInfinite(chatId),
 *     (old) => { ... }
 *   );
 * }
 * ```
 */
export class SocketCacheService {
  protected queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Invalidate queries by key — useful for generic cache busting on socket events.
   */
  invalidateQueries(queryKey: readonly unknown[]): void {
    logger.debug('Invalidating queries from socket event', {
      queryKey: queryKey.join('.'),
    });
    this.queryClient.invalidateQueries({ queryKey });
  }

  /**
   * Remove queries from cache — useful when a resource is deleted.
   */
  async removeQueries(queryKey: readonly unknown[]): Promise<void> {
    logger.debug('Removing queries from socket event', {
      queryKey: queryKey.join('.'),
    });
    await this.queryClient.cancelQueries({ queryKey });
    this.queryClient.removeQueries({ queryKey });
  }
}
