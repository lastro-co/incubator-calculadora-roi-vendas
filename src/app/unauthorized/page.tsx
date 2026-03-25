import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <svg
              aria-label="Acesso negado"
              className="h-6 w-6 text-yellow-600"
              fill="none"
              role="img"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Acesso negado</title>
              <path
                d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center font-extrabold text-3xl text-gray-900">
            Acesso Negado
          </h2>
          <p className="mt-2 text-center text-gray-600 text-sm">
            Você não tem permissão para acessar esta página.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            className="group relative flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            href="/"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
}
