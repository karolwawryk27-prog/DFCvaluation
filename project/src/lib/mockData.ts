import type {
  IncomeStatement,
  BalanceSheet,
  CashFlow,
  CompanyProfile,
  FinancialData,
} from '@/types';

const PROFILE: CompanyProfile = {
  symbol: 'AAPL',
  companyName: 'Apple Inc.',
  industry: 'Consumer Electronics',
  sector: 'Technology',
  description:
    'Apple Inc. designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services.',
  website: 'https://www.apple.com',
  ceo: 'Timothy D. Cook',
  mktCap: 3_450_000_000_000,
  price: 229.87,
  sharesOutstanding: 15_200_000_000,
  exchange: 'NASDAQ',
  currency: 'USD',
};

function mkIncome(year: string, rev: number, eps: number): IncomeStatement {
  const cogs = rev * 0.56;
  const opex = rev * 0.13;
  const operatingIncome = rev - cogs - opex;
  const interest = rev * 0.01;
  const tax = operatingIncome * 0.15;
  const netIncome = operatingIncome - interest - tax;
  const ebitda = operatingIncome + rev * 0.04;
  return {
    symbol: 'AAPL',
    date: `${year}-09-30`,
    calendarYear: year,
    revenue: rev,
    costOfRevenue: cogs,
    grossProfit: rev - cogs,
    grossProfitRatio: (rev - cogs) / rev,
    operatingExpenses: opex,
    operatingIncome,
    operatingIncomeRatio: operatingIncome / rev,
    netIncome,
    netIncomeRatio: netIncome / rev,
    eps,
    ebitda,
    interestExpense: interest,
    incomeTaxExpense: tax,
    sellingGeneralAndAdministrativeExpenses: opex * 0.7,
    researchAndDevelopmentExpenses: opex * 0.3,
  };
}

function mkBalance(
  year: string,
  assets: number,
  debt: number,
  cash: number,
): BalanceSheet {
  const equity = assets - assets * 0.28;
  const liab = assets - equity;
  return {
    symbol: 'AAPL',
    date: `${year}-09-30`,
    calendarYear: year,
    totalAssets: assets,
    totalLiabilities: liab,
    totalDebt: debt,
    totalEquity: equity,
    cashAndCashEquivalents: cash,
    shortTermInvestments: cash * 0.6,
    longTermDebt: debt * 0.7,
    shortTermDebt: debt * 0.3,
    retainedEarnings: equity * 0.4,
    totalCurrentAssets: assets * 0.3,
    totalCurrentLiabilities: liab * 0.35,
    netDebt: debt - cash,
  };
}

function mkCashFlow(year: string, rev: number): CashFlow {
  const ocf = rev * 0.28;
  const capex = -rev * 0.03;
  return {
    symbol: 'AAPL',
    date: `${year}-09-30`,
    calendarYear: year,
    operatingCashFlow: ocf,
    capitalExpenditure: capex,
    freeCashFlow: ocf + capex,
    netCashUsedForInvestingActivites: -rev * 0.05,
    netCashUsedProvidedByFinancingActivities: -rev * 0.1,
    dividendCashFlow: -rev * 0.015,
    stockRepurchased: -rev * 0.08,
  };
}

export function getMockFinancialData(): FinancialData {
  const years = ['2020', '2021', '2022', '2023', '2024'];
  const revs = [274_515_000_000, 365_817_000_000, 394_328_000_000, 383_285_000_000, 391_035_000_000];
  const epss = [3.28, 5.61, 6.05, 6.13, 6.11];
  const assets = [323_888_000_000, 351_002_000_000, 352_755_000_000, 352_416_000_000, 364_980_000_000];
  const debts = [112_436_000_000, 120_000_000_000, 120_000_000_000, 112_000_000_000, 108_000_000_000];
  const cashs = [38_026_000_000, 62_000_000_000, 24_000_000_000, 30_000_000_000, 34_000_000_000];

  return {
    profile: PROFILE,
    incomeStatements: years.map((y, i) => mkIncome(y, revs[i], epss[i])),
    balanceSheets: years.map((y, i) => mkBalance(y, assets[i], debts[i], cashs[i])),
    cashFlows: years.map((y, i) => mkCashFlow(y, revs[i])),
  };
}
