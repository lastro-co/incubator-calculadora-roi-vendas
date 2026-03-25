'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const errorMessages: Record<string, string> = {
  Configuration: 'Há um problema com a configuração do servidor.',
  AccessDenied: 'Acesso negado. Você não tem permissão para entrar.',
  Verification: 'O token de verificação expirou ou já foi usado.',
  Default: 'Ocorreu um erro durante a autenticação.',
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessage =
    error && errorMessages[error]
      ? errorMessages[error]
      : errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              aria-label="Erro"
              className="h-6 w-6 text-red-600"
              fill="none"
              role="img"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Erro</title>
              <path
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center font-extrabold text-3xl text-gray-900">
            Erro de Autenticação
          </h2>
          <p className="mt-2 text-center text-gray-600 text-sm">
            {errorMessage}
          </p>
        </div>

        <div className="space-y-4">
          <Link
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 font-medium text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            href="/auth/signin"
          >
            Tentar Novamente
          </Link>

          <Link
            className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            href="/"
          >
            Voltar ao Início
          </Link>
        </div>

        {error && (
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">Código do erro: {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
