'use client';

import { QueryErrorResetBoundary } from '@tanstack/react-query';
import React, { type PropsWithChildren } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { logger } from '@/lib/logger';

interface ErrorFallbackProps {
  error: unknown;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  React.useEffect(() => {
    logger.error('Error boundary caught error', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <h2 className="mb-2 font-semibold text-lg">Algo deu errado</h2>
          <p className="mb-4 text-sm">
            Ocorreu um erro inesperado. Nossa equipe foi notificada
            automaticamente.
          </p>
          <details className="text-xs opacity-75">
            <summary className="cursor-pointer">Detalhes técnicos</summary>
            <pre className="mt-2 whitespace-pre-wrap break-all">
              {errorMessage}
            </pre>
          </details>
        </div>

        <div className="flex gap-2">
          <button
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={resetErrorBoundary}
            type="button"
          >
            Tentar novamente
          </button>
          <button
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            onClick={() => window.location.reload()}
            type="button"
          >
            Recarregar página
          </button>
        </div>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps extends PropsWithChildren {
  /** Custom fallback component */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /** Called when an error occurs */
  onError?: (error: unknown, errorInfo: React.ErrorInfo) => void;
}

/**
 * Error boundary that integrates with React Query error reset boundary
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 *
 * @example
 * // With custom error handler
 * <ErrorBoundary onError={(error) => analytics.track('error', { error })}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export function ErrorBoundary({
  children,
  fallback: FallbackComponent = ErrorFallback,
  onError,
}: ErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ReactErrorBoundary
          FallbackComponent={(props: ErrorFallbackProps) => (
            <FallbackComponent
              {...props}
              resetErrorBoundary={() => {
                reset();
                props.resetErrorBoundary();
              }}
            />
          )}
          onError={onError}
        >
          {children}
        </ReactErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
