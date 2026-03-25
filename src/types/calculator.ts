export type Region =
  | 'SP'
  | 'RJ'
  | 'MG'
  | 'RS'
  | 'SC'
  | 'PR'
  | 'DF'
  | 'BA'
  | 'PE'
  | 'CE'
  | 'GO'
  | 'OUTROS';

export interface CalculatorInputs {
  monthlyLeads: number;
  region: Region;
  avgCommissionPercent: number;
  teamSize: number;
}

export interface CalculationStep {
  label: string;
  formula: string;
  result: number;
  unit: 'BRL' | 'number';
}

export interface ProductROI {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  steps: CalculationStep[];
  monthlySavings: number;
  monthlyRevenue: number;
  totalMonthly: number;
}

export interface ROIResult {
  inputs: CalculatorInputs;
  avgDealValue: number;
  products: ProductROI[];
  totalMonthlyGain: number;
  totalAnnualGain: number;
  totalMonthlySavings: number;
  totalMonthlyRevenue: number;
  roiMultiplier: number;
  platformMonthlyCost: number;
}
