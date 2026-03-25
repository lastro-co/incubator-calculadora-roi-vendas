'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@lastro-co/design-system';
import { formatCurrency, formatNumber } from '@/lib/calculations';
import type { ProductROI } from '@/types/calculator';

const PRODUCT_COLORS: Record<
  string,
  { border: string; bg: string; text: string; badge: string; stepBg: string }
> = {
  whatsapp: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    text: 'text-green-800',
    badge: 'bg-green-100 text-green-800',
    stepBg: 'bg-white/80',
  },
  remarketing: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    badge: 'bg-blue-100 text-blue-800',
    stepBg: 'bg-white/80',
  },
  'chat-ai': {
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    text: 'text-purple-800',
    badge: 'bg-purple-100 text-purple-800',
    stepBg: 'bg-white/80',
  },
  prospeccao: {
    border: 'border-orange-200',
    bg: 'bg-orange-50',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-800',
    stepBg: 'bg-white/80',
  },
};

function ProductCard({ product }: { product: ProductROI }) {
  const [expanded, setExpanded] = useState(true);
  const colors = PRODUCT_COLORS[product.id] ?? PRODUCT_COLORS.whatsapp;

  return (
    <Card className={`border ${colors.border}`}>
      <CardHeader className={`${colors.bg} rounded-t-lg pb-3`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{product.emoji}</span>
            <div>
              <CardTitle
                className={`text-base font-display ${colors.text}`}
              >
                {product.name}
              </CardTitle>
              <p className="text-gray-500 text-xs mt-0.5 leading-snug">
                {product.tagline}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={`rounded-lg px-2.5 py-1 text-sm font-bold ${colors.badge}`}
            >
              {formatCurrency(product.totalMonthly)}/mês
            </span>
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline-offset-2 hover:underline"
            >
              {expanded ? '▲ ocultar cálculo' : '▼ ver cálculo'}
            </button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-4">
          <div className="space-y-2">
            {product.steps.map((step, i) => (
              <div
                key={`${product.id}-step-${i}`}
                className={`flex items-start justify-between gap-4 rounded-lg ${colors.stepBg} border border-gray-100 px-3 py-2.5`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-700 text-xs">
                    {step.label}
                  </p>
                  <p className="font-mono text-gray-400 text-xs mt-0.5 truncate">
                    = {step.formula}
                  </p>
                </div>
                <span
                  className={`shrink-0 font-bold text-sm ${
                    step.unit === 'BRL' ? colors.text : 'text-gray-700'
                  }`}
                >
                  {step.unit === 'BRL'
                    ? formatCurrency(step.result)
                    : formatNumber(step.result)}
                </span>
              </div>
            ))}
          </div>

          <div
            className={`mt-3 flex items-center justify-between rounded-lg ${colors.badge} px-3 py-2.5`}
          >
            <span className="text-sm font-semibold">Total mensal estimado</span>
            <span className="text-sm font-bold">
              {formatCurrency(product.totalMonthly)}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface ProductBreakdownProps {
  products: ProductROI[];
}

export function ProductBreakdown({ products }: ProductBreakdownProps) {
  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h2 className="font-display text-xl font-bold text-gray-900">
          Memória de Cálculo por Produto
        </h2>
        <p className="text-gray-500 text-sm">
          Cada produto Lastro gera valor de forma independente. Veja o
          detalhamento completo abaixo.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
