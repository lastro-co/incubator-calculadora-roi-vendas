'use client';

import { useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@lastro-co/design-system';
import { calculateROI, formatCurrency } from '@/lib/calculations';
import {
  REGION_LABELS,
  REGIONAL_AVG_DEAL_VALUES,
  REGIONS,
} from '@/lib/constants';
import type { CalculatorInputs, Region } from '@/types/calculator';
import { ProductBreakdown } from './ProductBreakdown';
import { ROIResults } from './ROIResults';

const DEFAULT_INPUTS: CalculatorInputs = {
  monthlyLeads: 200,
  region: 'SP',
  avgCommissionPercent: 5,
  teamSize: 5,
};

function SliderField({
  label,
  value,
  min,
  max,
  step,
  displayValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayValue: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="font-medium text-gray-700 text-sm">{label}</label>
        <span className="font-bold text-lg text-purple-700">{displayValue}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer appearance-none rounded-full h-2 bg-gray-200 accent-purple-600"
      />
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min.toLocaleString('pt-BR')}</span>
        <span>{max.toLocaleString('pt-BR')}</span>
      </div>
    </div>
  );
}

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const results = useMemo(() => calculateROI(inputs), [inputs]);
  const avgDealValue = REGIONAL_AVG_DEAL_VALUES[inputs.region];

  function updateInput<K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K],
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário de inputs */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl text-gray-900">
              Dados do Cliente
            </CardTitle>
            <p className="text-gray-500 text-sm">
              Ajuste os valores conforme o perfil do cliente
            </p>
          </CardHeader>
          <CardContent className="space-y-7">
            <SliderField
              label="Leads mensais"
              value={inputs.monthlyLeads}
              min={50}
              max={5000}
              step={50}
              displayValue={`${inputs.monthlyLeads.toLocaleString('pt-BR')} leads/mês`}
              onChange={(v) => updateInput('monthlyLeads', v)}
            />

            <div className="space-y-2.5">
              <label className="font-medium text-gray-700 text-sm block">
                Região de atuação
              </label>
              <select
                value={inputs.region}
                onChange={(e) =>
                  updateInput('region', e.target.value as Region)
                }
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {REGION_LABELS[region]}
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-xs">
                Ticket médio em {REGION_LABELS[inputs.region]}:{' '}
                <strong className="text-gray-700">
                  {formatCurrency(avgDealValue)}
                </strong>
              </p>
            </div>

            <SliderField
              label="Comissão média por negócio"
              value={inputs.avgCommissionPercent}
              min={1}
              max={20}
              step={0.5}
              displayValue={`${inputs.avgCommissionPercent}%`}
              onChange={(v) => updateInput('avgCommissionPercent', v)}
            />

            <SliderField
              label="Tamanho do time de vendas"
              value={inputs.teamSize}
              min={1}
              max={50}
              step={1}
              displayValue={`${inputs.teamSize} ${
                inputs.teamSize === 1 ? 'vendedor' : 'vendedores'
              }`}
              onChange={(v) => updateInput('teamSize', v)}
            />
          </CardContent>
        </Card>

        {/* Resultados em tempo real */}
        <ROIResults results={results} />
      </div>

      {/* Toggle memória de cálculo */}
      <div className="text-center">
        <Button
          color="purple"
          variant={showBreakdown ? 'outlined' : 'contained'}
          onClick={() => setShowBreakdown((v) => !v)}
        >
          {showBreakdown
            ? 'Ocultar memória de cálculo'
            : 'Ver memória de cálculo detalhada'}
        </Button>
      </div>

      {showBreakdown && <ProductBreakdown products={results.products} />}
    </div>
  );
}
