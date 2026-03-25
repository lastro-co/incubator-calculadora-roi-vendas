export default function Loading() {
  return (
    <main className="flex h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p className="mt-4 text-gray-600 text-lg">Carregando...</p>
      </div>
    </main>
  );
}
