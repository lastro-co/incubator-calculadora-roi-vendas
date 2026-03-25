import { Alert, AlertDescription } from '@lastro-co/design-system';
import { Calculator } from '@/components/Calculator';

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <header className="bg-gray-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-purple-300 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 inline-block" />
              Ferramenta de Vendas · Lastro
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Calculadora de ROI
          </h1>
          <p className="mt-3 max-w-2xl text-base text-gray-400">
            Descubra quanto seu cliente pode ganhar usando a plataforma Lastro.
            Preencha os dados do perfil e veja a projeção de retorno em tempo real.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        <Calculator />

        {/* Disclaimer */}
        <Alert severity="info">
          <AlertDescription>
            <strong>Aviso importante:</strong> Os valores apresentados são{' '}
            <strong>projeções estimadas</strong> baseadas em benchmarks de
            mercado e nos resultados médios de clientes que utilizam a plataforma
            Lastro de forma otimizada. Os resultados reais podem variar conforme
            a qualidade dos leads, estratégia de abordagem e dedicação do time de
            vendas. Esta calculadora serve como referência indicativa para
            apresentações comerciais.
          </AlertDescription>
        </Alert>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Lastro · Calculadora de ROI para o
            Time de Vendas
          </p>
        </div>
      </footer>
    </div>
  );
}
