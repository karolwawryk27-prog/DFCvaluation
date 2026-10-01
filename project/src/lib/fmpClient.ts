import type {
  IncomeStatement,
  BalanceSheet,
  CashFlow,
  CompanyProfile,
  FinancialData,
} from '@/types';

const BASE_URL = 'https://financialmodelingprep.com/stable';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`FMP API error ${res.status}: ${text || res.statusText}`);
  }
  const json = await res.json();
  return json as T;
}

export async function fetchCompanyProfile(
  apiKey: string,
  ticker: string,
): Promise<CompanyProfile> {
  const data = await fetchJSON<any>(
    `${BASE_URL}/profile?symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`,
  );
  const arr = Array.isArray(data) ? data : [];
  if (arr.length === 0) {
    throw new Error(`No company profile found for ticker "${ticker}"`);
  }
  const d = arr[0];
  return {
    symbol: d.symbol ?? ticker,
    companyName: d.companyName ?? ticker,
    industry: d.industry ?? 'N/A',
    sector: d.sector ?? 'N/A',
    description: d.description ?? '',
    website: d.website ?? '',
    ceo: d.ceo ?? '',
    mktCap: typeof d.mktCap === 'number' ? d.mktCap : 0,
    price: typeof d.price === 'number' ? d.price : 0,
    sharesOutstanding: typeof d.sharesOutstanding === 'number' ? d.sharesOutstanding : (d.mktCap && d.price ? d.mktCap / d.price : 1),
    exchange: d.exchange ?? 'N/A',
    currency: d.currency || 'USD',
  };
}

export async function fetchIncomeStatements(
  apiKey: string,
  ticker: string,
  years = 5,
): Promise<IncomeStatement[]> {
  const data = await fetchJSON<any>(
    `${BASE_URL}/income-statement?symbol=${encodeURIComponent(ticker)}&limit=${years}&apikey=${apiKey}`,
  );
  const arr = Array.isArray(data) ? data : [];
  return arr.map((d) => ({
    symbol: d.symbol ?? '',
    date: d.date ?? '',
    calendarYear: d.calendarYear ?? d.date?.slice(0, 4) ?? '',
    revenue: typeof d.revenue === 'number' ? d.revenue : 0,
    costOfRevenue: typeof d.costOfRevenue === 'number' ? d.costOfRevenue : 0,
    grossProfit: typeof d.grossProfit === 'number' ? d.grossProfit : 0,
    grossProfitRatio: typeof d.grossProfitRatio === 'number' ? d.grossProfitRatio : 0,
    operatingExpenses: typeof d.operatingExpenses === 'number' ? d.operatingExpenses : 0,
    operatingIncome: typeof d.operatingIncome === 'number' ? d.operatingIncome : 0,
    operatingIncomeRatio: typeof d.operatingIncomeRatio === 'number' ? d.operatingIncomeRatio : 0,
    netIncome: typeof d.netIncome === 'number' ? d.netIncome : 0,
    netIncomeRatio: typeof d.netIncomeRatio === 'number' ? d.netIncomeRatio : 0,
    eps: typeof d.eps === 'number' ? d.eps : 0,
    ebitda: typeof d.ebitda === 'number' ? d.ebitda : 0,
    interestExpense: typeof d.interestExpense === 'number' ? d.interestExpense : 0,
    incomeTaxExpense: typeof d.incomeTaxExpense === 'number' ? d.incomeTaxExpense : 0,
    sellingGeneralAndAdministrativeExpenses: typeof d.sellingGeneralAndAdministrativeExpenses === 'number' ? d.sellingGeneralAndAdministrativeExpenses : 0,
    researchAndDevelopmentExpenses: typeof d.researchAndDevelopmentExpenses === 'number' ? d.researchAndDevelopmentExpenses : 0,
  }));
}

export async function fetchBalanceSheets(
  apiKey: string,
  ticker: string,
  years = 5,
): Promise<BalanceSheet[]> {
  const data = await fetchJSON<any>(
    `${BASE_URL}/balance-sheet-statement?symbol=${encodeURIComponent(ticker)}&limit=${years}&apikey=${apiKey}`,
  );
  const arr = Array.isArray(data) ? data : [];
  return arr.map((d) => ({
    symbol: d.symbol ?? '',
    date: d.date ?? '',
    calendarYear: d.calendarYear ?? d.date?.slice(0, 4) ?? '',
    totalAssets: typeof d.totalAssets === 'number' ? d.totalAssets : 0,
    totalLiabilities: typeof d.totalLiabilities === 'number' ? d.totalLiabilities : 0,
    totalDebt: typeof d.totalDebt === 'number' ? d.totalDebt : 0,
    totalEquity: typeof d.totalStockholdersEquity === 'number' ? d.totalStockholdersEquity : (typeof d.totalEquity === 'number' ? d.totalEquity : 0),
    cashAndCashEquivalents: typeof d.cashAndCashEquivalents === 'number' ? d.cashAndCashEquivalents : 0,
    shortTermInvestments: typeof d.shortTermInvestments === 'number' ? d.shortTermInvestments : 0,
    longTermDebt: typeof d.longTermDebt === 'number' ? d.longTermDebt : 0,
    shortTermDebt: typeof d.shortTermDebt === 'number' ? d.shortTermDebt : 0,
    retainedEarnings: typeof d.retainedEarnings === 'number' ? d.retainedEarnings : 0,
    totalCurrentAssets: typeof d.totalCurrentAssets === 'number' ? d.totalCurrentAssets : 0,
    totalCurrentLiabilities: typeof d.totalCurrentLiabilities === 'number' ? d.totalCurrentLiabilities : 0,
    netDebt: typeof d.netDebt === 'number' ? d.netDebt : 0,
  }));
}

export async function fetchCashFlows(
  apiKey: string,
  ticker: string,
  years = 5,
): Promise<CashFlow[]> {
  const data = await fetchJSON<any>(
    `${BASE_URL}/cash-flow-statement?symbol=${encodeURIComponent(ticker)}&limit=${years}&apikey=${apiKey}`,
  );
  const arr = Array.isArray(data) ? data : [];
  return arr.map((d) => ({
    symbol: d.symbol ?? '',
    date: d.date ?? '',
    calendarYear: d.calendarYear ?? d.date?.slice(0, 4) ?? '',
    operatingCashFlow: typeof d.operatingCashFlow === 'number' ? d.operatingCashFlow : 0,
    capitalExpenditure: typeof d.capitalExpenditure === 'number' ? d.capitalExpenditure : 0,
    freeCashFlow: typeof d.freeCashFlow === 'number' ? d.freeCashFlow : (typeof d.operatingCashFlow === 'number' && typeof d.capitalExpenditure === 'number' ? d.operatingCashFlow + d.capitalExpenditure : 0),
    netCashUsedForInvestingActivites: typeof d.netCashUsedForInvestingActivites === 'number' ? d.netCashUsedForInvestingActivites : 0,
    netCashUsedProvidedByFinancingActivities: typeof d.netCashUsedProvidedByFinancingActivities === 'number' ? d.netCashUsedProvidedByFinancingActivities : 0,
    dividendCashFlow: typeof d.dividendCashFlow === 'number' ? d.dividendCashFlow : 0,
    stockRepurchased: typeof d.stockRepurchased === 'number' ? d.stockRepurchased : 0,
  }));
}

export async function fetchFinancialData(
  apiKey: string,
  ticker: string,
): Promise<FinancialData> {
  const [profile, incomeStatements, balanceSheets, cashFlows] = await Promise.all([
    fetchCompanyProfile(apiKey, ticker),
    fetchIncomeStatements(apiKey, ticker),
    fetchBalanceSheets(apiKey, ticker),
    fetchCashFlows(apiKey, ticker),
  ]);
  return { profile, incomeStatements, balanceSheets, cashFlows };
}
