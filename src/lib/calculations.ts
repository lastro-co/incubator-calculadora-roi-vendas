import type { CalculatorInputs, ProductROI, ROIResult } from '@/types/calculator';
import {
  CHAT_AI_ASSUMPTIONS,
  PLATFORM_MONTHLY_COST,
  PROSPECCAO_ASSUMPTIONS,
  REGIONAL_AVG_DEAL_VALUES,
  REMARKETING_ASSUMPTIONS,
  WHATSAPP_ASSUMPTIONS,
} from './constants';

function fmtBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtN(n: number, decimals = 0): string {
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function calcWhatsApp(inputs: CalculatorInputs, avgDeal: number): ProductROI {
  const { monthlyLeads, avgCommissionPercent } = inputs;
  const commissionRate = avgCommissionPercent / 100;

  const leadsFollowedUp = monthlyLeads * WHATSAPP_ASSUMPTIONS.followUpRate;
  const hoursSaved =
    (leadsFollowedUp * WHATSAPP_ASSUMPTIONS.timePerFollowUpMinutes) / 60;
  const laborSavings = hoursSaved * WHATSAPP_ASSUMPTIONS.hourlyRateBRL;

  const extraDeals =
    monthlyLeads *
    WHATSAPP_ASSUMPTIONS.baseConversionRate *
    WHATSAPP_ASSUMPTIONS.conversionBoostRate;
  const extraRevenue = extraDeals * avgDeal * commissionRate;

  return {
    id: 'whatsapp',
    name: 'Automação WhatsApp',
    tagline: 'Follow-up automático e nutrição de leads via WhatsApp Business',
    emoji: '💬',
    steps: [
      {
        label: 'Leads com follow-up automatizado',
        formula: `${fmtN(monthlyLeads)} leads × ${WHATSAPP_ASSUMPTIONS.followUpRate * 100}% de cobertura`,
        result: leadsFollowedUp,
        unit: 'number',
      },
      {
        label: 'Horas economizadas por mês',
        formula: `${fmtN(leadsFollowedUp)} contatos × ${WHATSAPP_ASSUMPTIONS.timePerFollowUpMinutes} min ÷ 60`,
        result: hoursSaved,
        unit: 'number',
      },
      {
        label: 'Economia em mão de obra (SDR)',
        formula: `${fmtN(hoursSaved, 1)}h × ${fmtBRL(WHATSAPP_ASSUMPTIONS.hourlyRateBRL)}/hora`,
        result: laborSavings,
        unit: 'BRL',
      },
      {
        label: 'Negócios extras (resposta em < 5 min)',
        formula: `${fmtN(monthlyLeads)} leads × ${WHATSAPP_ASSUMPTIONS.baseConversionRate * 100}% tx.base × +${WHATSAPP_ASSUMPTIONS.conversionBoostRate * 100}% boost`,
        result: extraDeals,
        unit: 'number',
      },
      {
        label: 'Comissão extra por velocidade de resposta',
        formula: `${fmtN(extraDeals, 2)} negócios × ${fmtBRL(avgDeal)} × ${avgCommissionPercent}%`,
        result: extraRevenue,
        unit: 'BRL',
      },
    ],
    monthlySavings: laborSavings,
    monthlyRevenue: extraRevenue,
    totalMonthly: laborSavings + extraRevenue,
  };
}

function calcRemarketing(inputs: CalculatorInputs, avgDeal: number): ProductROI {
  const { monthlyLeads, avgCommissionPercent } = inputs;
  const commissionRate = avgCommissionPercent / 100;

  const coldLeads = monthlyLeads * REMARKETING_ASSUMPTIONS.coldLeadRate;
  const recoveredLeads = coldLeads * REMARKETING_ASSUMPTIONS.recoveryRate;
  const extraDeals = recoveredLeads * REMARKETING_ASSUMPTIONS.conversionRate;
  const extraRevenue = extraDeals * avgDeal * commissionRate;

  return {
    id: 'remarketing',
    name: 'Remarketing Automatizado',
    tagline: 'Reativação inteligente de leads frios com campanhas personalizadas',
    emoji: '🎯',
    steps: [
      {
        label: 'Leads que esfriaram este mês',
        formula: `${fmtN(monthlyLeads)} leads × ${REMARKETING_ASSUMPTIONS.coldLeadRate * 100}% taxa de resfriamento`,
        result: coldLeads,
        unit: 'number',
      },
      {
        label: 'Leads reativados pelo remarketing',
        formula: `${fmtN(coldLeads)} leads frios × ${REMARKETING_ASSUMPTIONS.recoveryRate * 100}% taxa de reativação`,
        result: recoveredLeads,
        unit: 'number',
      },
      {
        label: 'Negócios fechados com leads reativados',
        formula: `${fmtN(recoveredLeads, 1)} leads × ${REMARKETING_ASSUMPTIONS.conversionRate * 100}% conversão`,
        result: extraDeals,
        unit: 'number',
      },
      {
        label: 'Comissão recuperada via remarketing',
        formula: `${fmtN(extraDeals, 2)} negócios × ${fmtBRL(avgDeal)} × ${avgCommissionPercent}%`,
        result: extraRevenue,
        unit: 'BRL',
      },
    ],
    monthlySavings: 0,
    monthlyRevenue: extraRevenue,
    totalMonthly: extraRevenue,
  };
}

function calcChatAI(inputs: CalculatorInputs, avgDeal: number): ProductROI {
  const { monthlyLeads, avgCommissionPercent, teamSize } = inputs;
  const commissionRate = avgCommissionPercent / 100;

  const afterHoursLeads = monthlyLeads * CHAT_AI_ASSUMPTIONS.afterHoursLeadRate;
  const capturedLeads = afterHoursLeads * CHAT_AI_ASSUMPTIONS.captureRate;
  const extraDeals = capturedLeads * CHAT_AI_ASSUMPTIONS.conversionRate;
  const extraRevenue = extraDeals * avgDeal * commissionRate;
  const laborSavings = teamSize * CHAT_AI_ASSUMPTIONS.overtimeSavingsPerPerson;

  return {
    id: 'chat-ai',
    name: 'Chat com IA 24/7',
    tagline:
      'Atendimento, qualificação e agendamento automático fora do horário comercial',
    emoji: '🤖',
    steps: [
      {
        label: 'Leads que chegam fora do horário comercial',
        formula: `${fmtN(monthlyLeads)} leads × ${CHAT_AI_ASSUMPTIONS.afterHoursLeadRate * 100}% chegam fora do horário`,
        result: afterHoursLeads,
        unit: 'number',
      },
      {
        label: 'Leads capturados e qualificados pela IA',
        formula: `${fmtN(afterHoursLeads)} leads × ${CHAT_AI_ASSUMPTIONS.captureRate * 100}% taxa de captura`,
        result: capturedLeads,
        unit: 'number',
      },
      {
        label: 'Negócios fechados via chat IA',
        formula: `${fmtN(capturedLeads, 1)} leads × ${CHAT_AI_ASSUMPTIONS.conversionRate * 100}% conversão`,
        result: extraDeals,
        unit: 'number',
      },
      {
        label: 'Comissão extra pelo atendimento 24/7',
        formula: `${fmtN(extraDeals, 2)} negócios × ${fmtBRL(avgDeal)} × ${avgCommissionPercent}%`,
        result: extraRevenue,
        unit: 'BRL',
      },
      {
        label: 'Economia em plantão e horas extras do time',
        formula: `${teamSize} vendedores × ${fmtBRL(CHAT_AI_ASSUMPTIONS.overtimeSavingsPerPerson)}/mês`,
        result: laborSavings,
        unit: 'BRL',
      },
    ],
    monthlySavings: laborSavings,
    monthlyRevenue: extraRevenue,
    totalMonthly: laborSavings + extraRevenue,
  };
}

function calcProspeccao(inputs: CalculatorInputs, avgDeal: number): ProductROI {
  const { monthlyLeads, avgCommissionPercent } = inputs;
  const commissionRate = avgCommissionPercent / 100;

  const extraLeads =
    (monthlyLeads / 100) * PROSPECCAO_ASSUMPTIONS.additionalLeadsPerHundred;
  const extraDeals = extraLeads * PROSPECCAO_ASSUMPTIONS.conversionRate;
  const extraRevenue = extraDeals * avgDeal * commissionRate;
  const hoursSaved =
    (extraLeads * PROSPECCAO_ASSUMPTIONS.minutesPerManualProspect) / 60;
  const laborSavings = hoursSaved * WHATSAPP_ASSUMPTIONS.hourlyRateBRL;

  return {
    id: 'prospeccao',
    name: 'Prospecção Automática',
    tagline:
      'Geração e qualificação automática de novos leads com IA e bases de dados',
    emoji: '🔍',
    steps: [
      {
        label: 'Novos leads gerados automaticamente',
        formula: `${fmtN(monthlyLeads)} leads base ÷ 100 × ${PROSPECCAO_ASSUMPTIONS.additionalLeadsPerHundred} extras`,
        result: extraLeads,
        unit: 'number',
      },
      {
        label: 'Horas economizadas em prospecção manual',
        formula: `${fmtN(extraLeads)} leads × ${PROSPECCAO_ASSUMPTIONS.minutesPerManualProspect} min ÷ 60`,
        result: hoursSaved,
        unit: 'number',
      },
      {
        label: 'Economia em esforço de prospecção',
        formula: `${fmtN(hoursSaved, 1)}h × ${fmtBRL(WHATSAPP_ASSUMPTIONS.hourlyRateBRL)}/hora`,
        result: laborSavings,
        unit: 'BRL',
      },
      {
        label: 'Negócios fechados com novos leads',
        formula: `${fmtN(extraLeads)} novos leads × ${PROSPECCAO_ASSUMPTIONS.conversionRate * 100}% conversão`,
        result: extraDeals,
        unit: 'number',
      },
      {
        label: 'Comissão gerada por novos leads prospectados',
        formula: `${fmtN(extraDeals, 2)} negócios × ${fmtBRL(avgDeal)} × ${avgCommissionPercent}%`,
        result: extraRevenue,
        unit: 'BRL',
      },
    ],
    monthlySavings: laborSavings,
    monthlyRevenue: extraRevenue,
    totalMonthly: laborSavings + extraRevenue,
  };
}

/**
 * Calcula o ROI completo da plataforma Lastro para os inputs fornecidos.
 * Projeções baseadas em benchmarks de mercado e melhores práticas de uso da plataforma.
 */
export function calculateROI(inputs: CalculatorInputs): ROIResult {
  const avgDealValue = REGIONAL_AVG_DEAL_VALUES[inputs.region];

  const products: ProductROI[] = [
    calcWhatsApp(inputs, avgDealValue),
    calcRemarketing(inputs, avgDealValue),
    calcChatAI(inputs, avgDealValue),
    calcProspeccao(inputs, avgDealValue),
  ];

  const totalMonthlyGain = products.reduce((sum, p) => sum + p.totalMonthly, 0);
  const totalMonthlySavings = products.reduce(
    (sum, p) => sum + p.monthlySavings,
    0,
  );
  const totalMonthlyRevenue = products.reduce(
    (sum, p) => sum + p.monthlyRevenue,
    0,
  );

  return {
    inputs,
    avgDealValue,
    products,
    totalMonthlyGain,
    totalAnnualGain: totalMonthlyGain * 12,
    totalMonthlySavings,
    totalMonthlyRevenue,
    roiMultiplier: totalMonthlyGain / PLATFORM_MONTHLY_COST,
    platformMonthlyCost: PLATFORM_MONTHLY_COST,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
