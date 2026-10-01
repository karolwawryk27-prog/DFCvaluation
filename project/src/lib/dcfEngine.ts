import type { FinancialData, DCFResult } from '@/types';

function safeNum(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) return value;
  return fallback;
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function compoundAnnualGrowthRate(values: number[]): number {
  if (values.length < 2) return 0.05;
  const sorted = [...values].reverse();
  const start = sorted[0];
  const end = sorted[sorted.length - 1];
  if (start <= 0 || end <= 0) return 0.05;
  const n = sorted.length - 1;
  return Math.pow(end / start, 1 / n) - 1;
}

function safeSort<T extends { calendarYear: string }>(arr: T[]): T[] {
  return [...arr].sort((a, b) => {
    const ay = a.calendarYear || '';
    const by = b.calendarYear || '';
    return ay.localeCompare(by);
  });
}

export function runDCF(data: FinancialData): DCFResult {
  const { incomeStatements, balanceSheets, cashFlows, profile } = data;

  if (incomeStatements.length === 0 || balanceSheets.length === 0 || cashFlows.length === 0) {
    return {
      wacc: 0, costOfEquity: 0, costOfDebt: 0, terminalValue: 0,
      enterpriseValue: 0, equityValue: 0, netDebt: 0,
      impliedSharePrice: 0, currentPrice: 0, upsideDownside: 0,
      projectedFcf: [],
      assumptions: {
        revenueGrowthRate: 0, fcfMarginGrowth: 0, terminalGrowthRate: 0.025,
        taxRate: 0.21, riskFreeRate: 0.043, marketRiskPremium: 0.055, beta: 1.0,
      },
    };
  }

  const sortedIS = safeSort(incomeStatements);
  const sortedBS = safeSort(balanceSheets);
  const sortedCF = safeSort(cashFlows);

  const revenues = sortedIS.map((is) => safeNum(is.revenue));
  const fcfs = sortedCF.map((cf) => safeNum(cf.freeCashFlow));

  const revenueGrowthRate = Math.min(Math.max(compoundAnnualGrowthRate(revenues), 0.02), 0.25);
  const avgFcfMargin = avg(fcfs.map((f, i) => (revenues[i] > 0 ? f / revenues[i] : 0.2)));
  const terminalGrowthRate = 0.025;

  const latestBS = sortedBS[sortedBS.length - 1];
  const latestIS = sortedIS[sortedIS.length - 1];

  const totalDebt = safeNum(latestBS.totalDebt);
  const totalEquity = safeNum(latestBS.totalEquity);
  const cash = safeNum(latestBS.cashAndCashEquivalents);
  const netDebt = totalDebt - cash;

  const interestExpense = Math.abs(safeNum(latestIS.interestExpense));
  const preTaxIncome = safeNum(latestIS.operatingIncome) - interestExpense;
  const taxRate = safeNum(latestIS.incomeTaxExpense) && preTaxIncome > 0
    ? Math.min(Math.max(safeNum(latestIS.incomeTaxExpense) / preTaxIncome, 0.1), 0.35)
    : 0.21;

  const costOfDebt = totalDebt > 0 ? interestExpense / totalDebt : 0.05;
  const afterTaxCostOfDebt = costOfDebt * (1 - taxRate);

  const riskFreeRate = 0.043;
  const marketRiskPremium = 0.055;

  const stockVol = fcfs.map((f) => Math.abs(f)).filter((f) => f > 0);
  const revenueVol = revenues.map((r) => r).filter((r) => r > 0);
  const volatilityRatio = stockVol.length > 0 && revenueVol.length > 0
    ? avg(stockVol) / avg(revenueVol)
    : 0.25;
  let beta = 1.0;
  if (volatilityRatio > 0.35) beta = 1.3;
  else if (volatilityRatio > 0.25) beta = 1.15;
  else if (volatilityRatio > 0.18) beta = 1.0;
  else beta = 0.85;

  const costOfEquity = riskFreeRate + beta * marketRiskPremium;

  const totalCapital = totalDebt + totalEquity;
  const weightOfEquity = totalCapital > 0 ? totalEquity / totalCapital : 1;
  const weightOfDebt = totalCapital > 0 ? totalDebt / totalCapital : 0;

  const wacc = weightOfEquity * costOfEquity + weightOfDebt * afterTaxCostOfDebt;

  const latestRevenue = revenues[revenues.length - 1];
  const projectedRevenues: number[] = [];
  let rev = latestRevenue;
  for (let i = 0; i < 5; i++) {
    rev = rev * (1 + revenueGrowthRate);
    projectedRevenues.push(rev);
  }

  const fcfMarginSlightlyGrowing = avgFcfMargin;
  const projectedFcf = projectedRevenues.map(
    (r, i) => r * Math.min(fcfMarginSlightlyGrowing * (1 + 0.005 * i), avgFcfMargin * 1.05),
  );

  const presentValues = projectedFcf.map((f, i) => f / Math.pow(1 + wacc, i + 1));

  const terminalFcf = projectedFcf[projectedFcf.length - 1] * (1 + terminalGrowthRate);
  const terminalValue = terminalFcf / (wacc - terminalGrowthRate);
  const pvTerminalValue = terminalValue / Math.pow(1 + wacc, 5);

  const enterpriseValue = presentValues.reduce((a, b) => a + b, 0) + pvTerminalValue;
  const equityValue = enterpriseValue - netDebt;
  const sharesOutstanding = safeNum(profile.sharesOutstanding, 1);
  const impliedSharePrice = equityValue / sharesOutstanding;
  const currentPrice = safeNum(profile.price);
  const upsideDownside = currentPrice > 0
    ? (impliedSharePrice - currentPrice) / currentPrice
    : 0;

  return {
    wacc,
    costOfEquity,
    costOfDebt,
    terminalValue,
    enterpriseValue,
    equityValue,
    netDebt,
    impliedSharePrice,
    currentPrice,
    upsideDownside,
    projectedFcf: projectedFcf.map((fcf, i) => ({
      year: i + 1,
      fcf,
      presentValue: presentValues[i],
    })),
    assumptions: {
      revenueGrowthRate,
      fcfMarginGrowth: 0.005,
      terminalGrowthRate,
      taxRate,
      riskFreeRate,
      marketRiskPremium,
      beta,
    },
  };
}

export function formatCurrency(value: number, compact = true): string {
  const v = safeNum(value);
  if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(2)}T`;
  if (Math.abs(v) >= 1e9) return compact ? `${(v / 1e9).toFixed(2)}B` : `${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (Math.abs(v) >= 1e6) return compact ? `${(v / 1e6).toFixed(1)}M` : `${v.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  return `${v.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

export function formatPercent(value: number, digits = 2): string {
  const v = safeNum(value);
  return `${(v * 100).toFixed(digits)}%`;
}

export function formatPrice(value: number): string {
  const v = safeNum(value);
  return `${v.toFixed(2)}`;
}

export function formatRaw(value: number, digits = 2): string {
  const v = safeNum(value);
  return v.toFixed(digits);
}
