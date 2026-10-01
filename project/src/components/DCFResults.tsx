import type { FinancialData, DCFResult } from '@/types';
import { formatCurrency, formatPercent, formatPrice } from '@/lib/dcfEngine';
import { Download, Loader2, Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useState } from 'react';

interface DCFResultsProps {
  data: FinancialData;
  dcf: DCFResult;
  onExport: () => void;
}

function MetricCard({
  label,
  value,
  sublabel,
  highlight,
}: {
  label: string;
  value: string;
  sublabel?: string;
  highlight?: 'gold' | 'green' | 'red' | 'blue';
}) {
  const colorClasses = {
    gold: 'text-amber-400 border-amber-800/40 bg-amber-950/20',
    green: 'text-emerald-400 border-emerald-800/40 bg-emerald-950/20',
    red: 'text-red-400 border-red-800/40 bg-red-950/20',
    blue: 'text-blue-400 border-blue-800/40 bg-blue-950/20',
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? colorClasses[highlight] : 'border-slate-700/50 bg-slate-900/60'
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${highlight ? colorClasses[highlight].split(' ')[0] : 'text-slate-100'}`}>
        {value}
      </div>
      {sublabel && (
        <div className="mt-0.5 text-xs text-slate-500">{sublabel}</div>
      )}
    </div>
  );
}

export default function DCFResults({ data, dcf, onExport }: DCFResultsProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await onExport();
    } finally {
      setExporting(false);
    }
  };

  const isUndervalued = dcf.upsideDownside > 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-bold text-slate-100">DCF Valuation Results</h3>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? 'Generating...' : 'Export to PowerPoint'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <MetricCard label="WACC" value={formatPercent(dcf.wacc)} sublabel="Discount rate" highlight="blue" />
          <MetricCard label="Terminal Value" value={formatCurrency(dcf.terminalValue)} sublabel="Perpetuity" />
          <MetricCard label="Enterprise Value" value={formatCurrency(dcf.enterpriseValue)} sublabel="PV of FCFs + TV" />
          <MetricCard label="Equity Value" value={formatCurrency(dcf.equityValue)} sublabel="EV - Net Debt" />
          <MetricCard
            label="Implied Share Price"
            value={formatPrice(dcf.impliedSharePrice)}
            sublabel="DCF output"
            highlight="gold"
          />
          <MetricCard
            label="Current Price"
            value={formatPrice(dcf.currentPrice)}
            sublabel="Market price"
          />
        </div>

        <div
          className={`mt-4 flex items-center gap-3 rounded-xl border p-4 ${
            isUndervalued
              ? 'border-emerald-800/40 bg-emerald-950/20'
              : 'border-red-800/40 bg-red-950/20'
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${
              isUndervalued ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}
          >
            {isUndervalued ? (
              <ArrowUpRight className="h-6 w-6" />
            ) : (
              <ArrowDownRight className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-200">
              {isUndervalued ? 'Undervalued' : 'Overvalued'} by{' '}
              <span className={isUndervalued ? 'text-emerald-400' : 'text-red-400'}>
                {formatPercent(Math.abs(dcf.upsideDownside))}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              DCF implies {formatPrice(dcf.impliedSharePrice)} vs. current {formatPrice(dcf.currentPrice)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Projected Free Cash Flows (5Y)
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/40 text-right">
                  <th className="px-3 py-2 text-left font-medium text-slate-400">Year</th>
                  <th className="px-3 py-2 font-medium text-slate-400">Projected FCF</th>
                  <th className="px-3 py-2 font-medium text-slate-400">Present Value</th>
                </tr>
              </thead>
              <tbody>
                {dcf.projectedFcf.map((p) => (
                  <tr key={p.year} className="border-b border-slate-800/40 hover:bg-slate-800/20">
                    <td className="px-3 py-2.5 text-left font-medium text-slate-300">
                      Year {p.year}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-100">
                      {formatCurrency(p.fcf)}
                    </td>
                    <td className="px-3 py-2.5 text-right text-blue-400">
                      {formatCurrency(p.presentValue)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-700 bg-slate-800/30 font-semibold">
                  <td className="px-3 py-2.5 text-left text-slate-300">Terminal Value PV</td>
                  <td className="px-3 py-2.5 text-right text-slate-500">—</td>
                  <td className="px-3 py-2.5 text-right text-blue-400">
                    {formatCurrency(dcf.terminalValue / Math.pow(1 + dcf.wacc, 5))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
            Assumptions & Capital Structure
          </h4>
          <div className="space-y-3">
            {[
              { label: 'Revenue Growth Rate (CAGR)', value: formatPercent(dcf.assumptions.revenueGrowthRate) },
              { label: 'Terminal Growth Rate', value: formatPercent(dcf.assumptions.terminalGrowthRate) },
              { label: 'Risk-Free Rate (10Y Treasury)', value: formatPercent(dcf.assumptions.riskFreeRate) },
              { label: 'Market Risk Premium', value: formatPercent(dcf.assumptions.marketRiskPremium) },
              { label: 'Beta (estimated)', value: dcf.assumptions.beta.toFixed(2) },
              { label: 'Cost of Equity', value: formatPercent(dcf.costOfEquity) },
              { label: 'Cost of Debt (after-tax)', value: formatPercent(dcf.costOfDebt * (1 - dcf.assumptions.taxRate)) },
              { label: 'Effective Tax Rate', value: formatPercent(dcf.assumptions.taxRate) },
              { label: 'Net Debt', value: formatCurrency(dcf.netDebt) },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between border-b border-slate-800/40 pb-2"
              >
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className="text-sm font-semibold text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
