import Link from 'next/link';

export default function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <p>Oops! Página não encontrada.</p>
      <Link href="/">Voltar para a Home</Link>
    </main>
  );
}
