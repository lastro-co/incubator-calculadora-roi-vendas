import { formatCurrency, formatNumber } from '@/lib/calculations';
import type { ROIResult } from '@/types/calculator';

interface ROIResultsProps {
  results: ROIResult;
}

function MetricCard({
  label,
  value,
  sublabel,
  highlight,
  emoji,
}: {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: boolean;
  emoji?: string;
}) {
  return (
    <div
      className={`rounded-xl p-4 ${
        highlight
          ? 'bg-emerald-50 border-2 border-emerald-200'
          : 'bg-gray-50 border border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-xs font-medium leading-tight ${
            highlight ? 'text-emerald-700' : 'text-gray-500'
          }`}
        >
          {label}
        </p>
        {emoji && <span className="text-base">{emoji}</span>}
      </div>
      <p
        className={`mt-1 font-display text-2xl font-bold ${
          highlight ? 'text-emerald-700' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
      {sublabel && (
        <p className="mt-0.5 text-xs text-gray-400">{sublabel}</p>
      )}
    </div>
  );
}

export function ROIResults({ results }: ROIResultsProps) {
  const {
    totalMonthlyGain,
    totalAnnualGain,
    totalMonthlySavings,
    totalMonthlyRevenue,
    roiMultiplier,
    platformMonthlyCost,
  } = results;

  return (
    <div className="flex flex-col gap-4">
      {/* Hero: Ganho anual */}
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 text-white shadow-md">
        <p className="text-emerald-100 text-sm font-medium">
          💰 Ganho estimado no primeiro ano
        </p>
        <p className="mt-2 font-display text-4xl font-bold">
          {formatCurrency(totalAnnualGain)}
        </p>
        <p className="mt-1 text-emerald-200 text-sm">
          {formatCurrency(totalMonthlyGain)}/mês com a plataforma Lastro
        </p>
      </div>

      {/* ROI Multiplier */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-700 to-purple-950 p-5 text-white shadow-md">
        <p className="text-purple-200 text-sm font-medium">
          📈 Retorno sobre investimento (ROI)
        </p>
        <div className="mt-2 flex items-end gap-3">
          <p className="font-display text-4xl font-bold">
            {formatNumber(roiMultiplier, 1)}x
          </p>
          <p className="mb-1 text-purple-300 text-sm leading-snug">
            de retorno para cada
            <br />
            R$ 1 investido na plataforma
          </p>
        </div>
        <p className="mt-2 text-purple-400 text-xs">
          Plataforma Lastro: {formatCurrency(platformMonthlyCost)}/mês
        </p>
      </div>

      {/* Grade de métricas */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Economia mensal"
          value={formatCurrency(totalMonthlySavings)}
          sublabel="tempo e custos operacionais"
          emoji="⏱️"
        />
        <MetricCard
          label="Receita extra/mês"
          value={formatCurrency(totalMonthlyRevenue)}
          sublabel="novos negócios fechados"
          emoji="🏆"
        />
        <MetricCard
          label="Ganho mensal total"
          value={formatCurrency(totalMonthlyGain)}
          sublabel="economia + receita extra"
          highlight
          emoji="✅"
        />
        <MetricCard
          label="Projeção anual"
          value={formatCurrency(totalAnnualGain)}
          sublabel="12 meses de uso da plataforma"
          highlight
          emoji="🚀"
        />
      </div>
    </div>
  );
}
