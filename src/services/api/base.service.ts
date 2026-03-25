import { fetcher } from '@/lib/fetcher/index';

export abstract class BaseApiService {
  protected async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return fetcher<T>(endpoint, { method: 'GET', ...options });
  }

  protected async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return fetcher<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  protected async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return fetcher<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  protected async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return fetcher<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  protected async delete<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    return fetcher<T>(endpoint, { method: 'DELETE', ...options });
  }
}
