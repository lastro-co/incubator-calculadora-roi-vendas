'use client';

import { useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log for analytics or debugging
    logger.error('Error occurred', error);
  }, [error]);

  return (
    <main>
      <h1>Algo deu errado</h1>

      <p>Tente recarregar a página ou voltar mais tarde.</p>

      <button onClick={reset} type="button">
        Tentar novamente
      </button>
    </main>
  );
}
