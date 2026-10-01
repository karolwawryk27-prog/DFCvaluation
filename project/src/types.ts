export interface IncomeStatement {
  symbol: string;
  date: string;
  calendarYear: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  operatingExpenses: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  ebitda: number;
  interestExpense: number;
  incomeTaxExpense: number;
  sellingGeneralAndAdministrativeExpenses: number;
  researchAndDevelopmentExpenses: number;
}

export interface BalanceSheet {
  symbol: string;
  date: string;
  calendarYear: string;
  totalAssets: number;
  totalLiabilities: number;
  totalDebt: number;
  totalEquity: number;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  longTermDebt: number;
  shortTermDebt: number;
  retainedEarnings: number;
  totalCurrentAssets: number;
  totalCurrentLiabilities: number;
  netDebt: number;
}

export interface CashFlow {
  symbol: string;
  date: string;
  calendarYear: string;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  netCashUsedForInvestingActivites: number;
  netCashUsedProvidedByFinancingActivities: number;
  dividendCashFlow: number;
  stockRepurchased: number;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  industry: string;
  sector: string;
  description: string;
  website: string;
  ceo: string;
  mktCap: number;
  price: number;
  sharesOutstanding: number;
  exchange: string;
  currency: string;
}

export interface FinancialData {
  profile: CompanyProfile;
  incomeStatements: IncomeStatement[];
  balanceSheets: BalanceSheet[];
  cashFlows: CashFlow[];
}

export interface DCFResult {
  wacc: number;
  costOfEquity: number;
  costOfDebt: number;
  terminalValue: number;
  enterpriseValue: number;
  equityValue: number;
  netDebt: number;
  impliedSharePrice: number;
  currentPrice: number;
  upsideDownside: number;
  projectedFcf: { year: number; fcf: number; presentValue: number }[];
  assumptions: {
    revenueGrowthRate: number;
    fcfMarginGrowth: number;
    terminalGrowthRate: number;
    taxRate: number;
    riskFreeRate: number;
    marketRiskPremium: number;
    beta: number;
  };
}
