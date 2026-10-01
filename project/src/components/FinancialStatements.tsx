import type { FinancialData } from '@/types';
import { formatCurrency, formatPercent, formatRaw } from '@/lib/dcfEngine';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinancialStatementsProps {
  data: FinancialData;
}

function GrowthArrow({ value }: { value: number | null }) {
  if (value === null || value === undefined || isNaN(value)) {
    return <span className="text-slate-600">—</span>;
  }
  const pct = value * 100;
  if (pct > 0.1) {
    return (
      <span className="inline-flex items-center gap-0.5 text-emerald-400">
        <TrendingUp className="h-3 w-3" />
        {pct.toFixed(1)}%
      </span>
    );
  }
  if (pct < -0.1) {
    return (
      <span className="inline-flex items-center gap-0.5 text-red-400">
        <TrendingDown className="h-3 w-3" />
        {pct.toFixed(1)}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-slate-400">
      <Minus className="h-3 w-3" />
      {pct.toFixed(1)}%
    </span>
  );
}

function StatementTable({
  title,
  years,
  rows,
}: {
  title: string;
  years: string[];
  rows: { label: string; values: number[]; format: 'currency' | 'percent' | 'raw' }[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60">
      <div className="border-b border-slate-700/50 bg-slate-800/40 px-5 py-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          {title}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/40 text-right">
              <th className="px-5 py-2.5 text-left font-medium text-slate-400">Metric</th>
              {years.map((y) => (
                <th key={y} className="px-4 py-2.5 font-medium text-slate-400">
                  {y}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={row.label}
                className={`border-b border-slate-800/50 transition hover:bg-slate-800/30 ${
                  ri % 2 === 1 ? 'bg-slate-800/10' : ''
                }`}
              >
                <td className="px-5 py-2.5 text-left font-medium text-slate-300">
                  {row.label}
                </td>
                {row.values.map((val, vi) => {
                  const prev = vi > 0 ? row.values[vi - 1] : null;
                  const growth = prev !== null && prev !== 0
                    ? (val - prev) / Math.abs(prev)
                    : null;
                  return (
                    <td key={vi} className="px-4 py-2.5 text-right">
                      <div className="text-slate-100">
                        {row.format === 'currency'
                          ? formatCurrency(val)
                          : row.format === 'percent'
                            ? formatPercent(val)
                            : formatRaw(val)}
                      </div>
                      {row.format === 'currency' && vi > 0 && (
                        <div className="mt-0.5 text-xs">
                          <GrowthArrow value={growth} />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FinancialStatements({ data }: FinancialStatementsProps) {
  const years = data.incomeStatements.map((is) => is.calendarYear).reverse();

  const is = [...data.incomeStatements].reverse();
  const bs = [...data.balanceSheets].reverse();
  const cf = [...data.cashFlows].reverse();

  return (
    <div className="space-y-5">
      <StatementTable
        title="Income Statement"
        years={years}
        rows={[
          { label: 'Revenue', values: is.map((d) => d.revenue), format: 'currency' },
          { label: 'Gross Profit', values: is.map((d) => d.grossProfit), format: 'currency' },
          { label: 'Gross Margin', values: is.map((d) => d.grossProfitRatio), format: 'percent' },
          { label: 'Operating Income', values: is.map((d) => d.operatingIncome), format: 'currency' },
          { label: 'Operating Margin', values: is.map((d) => d.operatingIncomeRatio), format: 'percent' },
          { label: 'Net Income', values: is.map((d) => d.netIncome), format: 'currency' },
          { label: 'Net Margin', values: is.map((d) => d.netIncomeRatio), format: 'percent' },
          { label: 'EPS', values: is.map((d) => d.eps), format: 'raw' },
          { label: 'EBITDA', values: is.map((d) => d.ebitda), format: 'currency' },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <StatementTable
          title="Balance Sheet"
          years={years}
          rows={[
            { label: 'Total Assets', values: bs.map((d) => d.totalAssets), format: 'currency' },
            { label: 'Total Liabilities', values: bs.map((d) => d.totalLiabilities), format: 'currency' },
            { label: 'Total Debt', values: bs.map((d) => d.totalDebt), format: 'currency' },
            { label: 'Net Debt', values: bs.map((d) => d.netDebt), format: 'currency' },
            { label: 'Cash & Equivalents', values: bs.map((d) => d.cashAndCashEquivalents), format: 'currency' },
            { label: 'Total Equity', values: bs.map((d) => d.totalEquity), format: 'currency' },
          ]}
        />

        <StatementTable
          title="Cash Flow Statement"
          years={years}
          rows={[
            { label: 'Operating CF', values: cf.map((d) => d.operatingCashFlow), format: 'currency' },
            { label: 'CapEx', values: cf.map((d) => d.capitalExpenditure), format: 'currency' },
            { label: 'Free Cash Flow', values: cf.map((d) => d.freeCashFlow), format: 'currency' },
            { label: 'Investing CF', values: cf.map((d) => d.netCashUsedForInvestingActivites), format: 'currency' },
            { label: 'Financing CF', values: cf.map((d) => d.netCashUsedProvidedByFinancingActivities), format: 'currency' },
            { label: 'Dividends Paid', values: cf.map((d) => d.dividendCashFlow), format: 'currency' },
            { label: 'Buybacks', values: cf.map((d) => d.stockRepurchased), format: 'currency' },
          ]}
        />
      </div>
    </div>
  );
}
