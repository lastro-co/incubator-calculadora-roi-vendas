'use client';

import { useCallback } from 'react';
import { STATUS_CODES } from '@/constants/api/status-codes';
import { ApiError, NetworkError, ValidationError } from '@/lib/error-handler';
import { logger } from '@/lib/logger';

interface UseApiErrorReturn {
  /** Handle and log API errors with user-friendly messages */
  handleError: (error: unknown) => string;
  /** Check if error is retryable */
  isRetryableError: (error: unknown) => boolean;
  /** Get user-friendly error message */
  getErrorMessage: (error: unknown) => string;
}

/**
 * Hook for consistent API error handling across the application
 *
 * @example
 * const { handleError, isRetryableError } = useApiError();
 *
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const message = handleError(error);
 *   toast.error(message);
 * }
 */
export function useApiError(): UseApiErrorReturn {
  const handleError = useCallback((error: unknown): string => {
    // Only log errors that haven't been logged by their constructors
    // ApiError, NetworkError, and ValidationError already log in their constructors
    if (
      !(error instanceof ApiError) &&
      !(error instanceof NetworkError) &&
      !(error instanceof ValidationError)
    ) {
      logger.error('API error occurred', error as Error);
    }

    if (error instanceof ApiError) {
      return getApiErrorMessage(error);
    }

    if (error instanceof NetworkError) {
      return 'Problema de conexão. Verifique sua internet e tente novamente.';
    }

    if (error instanceof ValidationError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Erro desconhecido. Tente novamente em alguns instantes.';
  }, []);

  const isRetryableError = useCallback((error: unknown): boolean => {
    if (error instanceof ApiError) {
      return (
        error.statusCode >= STATUS_CODES.INTERNAL_SERVER_ERROR ||
        error.statusCode === STATUS_CODES.TOO_MANY_REQUESTS
      );
    }

    if (error instanceof NetworkError) {
      return true;
    }

    return false;
  }, []);

  const getErrorMessage = useCallback(
    (error: unknown): string => {
      return handleError(error);
    },
    [handleError]
  );

  return {
    handleError,
    isRetryableError,
    getErrorMessage,
  };
}

function getApiErrorMessage(error: ApiError): string {
  switch (error.statusCode) {
    case STATUS_CODES.BAD_REQUEST:
      return 'Requisição inválida. Verifique os dados enviados.';
    case STATUS_CODES.UNAUTHORIZED:
      return 'Sua sessão expirou. Faça login novamente.';
    case STATUS_CODES.FORBIDDEN:
      return 'Você não tem permissão para realizar esta ação.';
    case STATUS_CODES.NOT_FOUND:
      return 'Recurso não encontrado.';
    case STATUS_CODES.CONFLICT:
      return 'Conflito de dados. Verifique se o recurso já existe.';
    case STATUS_CODES.UNPROCESSABLE_ENTITY:
      return 'Dados inválidos. Verifique os campos obrigatórios.';
    case STATUS_CODES.TOO_MANY_REQUESTS:
      return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.';
    case STATUS_CODES.INTERNAL_SERVER_ERROR:
      return 'Erro interno do servidor. Nossa equipe foi notificada.';
    case STATUS_CODES.BAD_GATEWAY:
    case STATUS_CODES.SERVICE_UNAVAILABLE:
    case STATUS_CODES.GATEWAY_TIMEOUT:
      return 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.';
    default:
      return error.message || 'Erro na requisição.';
  }
}
