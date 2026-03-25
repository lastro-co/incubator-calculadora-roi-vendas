import type { Region } from '@/types/calculator';

export const REGION_LABELS: Record<Region, string> = {
  SP: 'São Paulo',
  RJ: 'Rio de Janeiro',
  MG: 'Minas Gerais',
  RS: 'Rio Grande do Sul',
  SC: 'Santa Catarina',
  PR: 'Paraná',
  DF: 'Distrito Federal',
  BA: 'Bahia',
  PE: 'Pernambuco',
  CE: 'Ceará',
  GO: 'Goiás',
  OUTROS: 'Outros Estados',
};

/**
 * Ticket médio por negócio fechado por região (em R$).
 * Baseado em médias de mercado do setor imobiliário e CRM brasileiro.
 */
export const REGIONAL_AVG_DEAL_VALUES: Record<Region, number> = {
  SP: 15000,
  RJ: 12000,
  MG: 10000,
  RS: 11000,
  SC: 12000,
  PR: 11500,
  DF: 13000,
  BA: 8000,
  PE: 7500,
  CE: 7000,
  GO: 9000,
  OUTROS: 9000,
};

export const REGIONS: Region[] = [
  'SP',
  'RJ',
  'MG',
  'PR',
  'SC',
  'RS',
  'DF',
  'GO',
  'BA',
  'PE',
  'CE',
  'OUTROS',
];

/**
 * Premissas para Automação WhatsApp.
 * Baseadas em benchmarks de SDR e automação de vendas no Brasil.
 */
export const WHATSAPP_ASSUMPTIONS = {
  /** % dos leads que recebem follow-up via WhatsApp */
  followUpRate: 0.8,
  /** Tempo economizado por follow-up manual (minutos) */
  timePerFollowUpMinutes: 5,
  /** Custo hora do SDR/vendedor (R$) */
  hourlyRateBRL: 60,
  /** Taxa de conversão base sem automação */
  baseConversionRate: 0.03,
  /** Boost de conversão com resposta rápida via WhatsApp */
  conversionBoostRate: 0.15,
} as const;

/**
 * Premissas para Remarketing Automatizado.
 * Baseadas em benchmarks de e-mail marketing e reengajamento CRM.
 */
export const REMARKETING_ASSUMPTIONS = {
  /** % dos leads que esfria por mês sem remarketing ativo */
  coldLeadRate: 0.4,
  /** % dos leads frios reativados pelo remarketing */
  recoveryRate: 0.12,
  /** % dos leads recuperados que efetivamente convertem */
  conversionRate: 0.1,
} as const;

/**
 * Premissas para Chat com IA 24/7.
 * Baseadas em benchmarks de chatbots e atendimento digital imobiliário.
 */
export const CHAT_AI_ASSUMPTIONS = {
  /** % dos leads que chegam fora do horário comercial */
  afterHoursLeadRate: 0.3,
  /** % desses leads capturados e qualificados pelo chat IA */
  captureRate: 0.6,
  /** Taxa de conversão dos leads capturados pelo IA */
  conversionRate: 0.15,
  /** Economia mensal em horas extras/plantão por vendedor (R$) */
  overtimeSavingsPerPerson: 800,
} as const;

/**
 * Premissas para Prospecção Automática.
 * Baseadas em benchmarks de geração de leads com IA e bases de dados.
 */
export const PROSPECCAO_ASSUMPTIONS = {
  /** Novos leads gerados por IA para cada 100 leads mensais da base */
  additionalLeadsPerHundred: 25,
  /** Taxa de conversão dos leads prospectados automaticamente */
  conversionRate: 0.08,
  /** Tempo médio gasto em prospecção manual por lead (minutos) */
  minutesPerManualProspect: 30,
} as const;

/**
 * Custo médio mensal da plataforma Lastro.
 * Utilizado como denominador no cálculo do multiplicador de ROI.
 */
export const PLATFORM_MONTHLY_COST = 2000;
