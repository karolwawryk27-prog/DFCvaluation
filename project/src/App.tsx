import { useState, useMemo, useCallback } from 'react';
import { LineChart, Settings as SettingsIcon, BarChart3, Wallet } from 'lucide-react';
import type { FinancialData } from '@/types';
import { fetchFinancialData } from '@/lib/fmpClient';
import { getMockFinancialData } from '@/lib/mockData';
import { runDCF } from '@/lib/dcfEngine';
import { exportToPowerPoint } from '@/lib/pptxExporter';
import SearchBar from '@/components/SearchBar';
import SettingsModal from '@/components/SettingsModal';
import CompanyHeader from '@/components/CompanyHeader';
import FinancialStatements from '@/components/FinancialStatements';
import DCFResults from '@/components/DCFResults';

const STORAGE_KEY = 'fmp_api_key';

function loadApiKey(): string {
  // 1. Check if Vercel has the key hidden securely in the environment
  if (import.meta.env.VITE_FMP_API_KEY) {
    return import.meta.env.VITE_FMP_API_KEY;
  }
  
  // 2. Otherwise, fall back to checking the browser
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function saveApiKey(key: string) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch {
    // ignore
  }
}

export default function App() {
  const [apiKey, setApiKey] = useState<string>(loadApiKey);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialData>(() =>
    getMockFinancialData(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticker, setTicker] = useState('AAPL');
  const [usingMock, setUsingMock] = useState(true);

  const dcfResult = useMemo(() => runDCF(financialData), [financialData]);

  const handleSearch = useCallback(
    async (searchTicker: string) => {
      if (!apiKey) {
        setError('Please add your FMP API key in Settings to search live data.');
        setSettingsOpen(true);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await fetchFinancialData(apiKey, searchTicker);
        if (
          data.incomeStatements.length === 0 ||
          data.balanceSheets.length === 0 ||
          data.cashFlows.length === 0
        ) {
          throw new Error(
            `Incomplete financial data for "${searchTicker}". This may be a non-US stock or a ticker without 5 years of history.`,
          );
        }
        setFinancialData(data);
        setTicker(searchTicker);
        setUsingMock(false);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [apiKey],
  );

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    saveApiKey(key);
    if (key) setUsingMock(false);
  };

  const handleExport = useCallback(async () => {
    await exportToPowerPoint(financialData, dcfResult);
  }, [financialData, dcfResult]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-900/30">
              <LineChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-100">
                FinAnalytics
              </h1>
              <p className="text-xs text-slate-500">DCF Valuation Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                usingMock
                  ? 'bg-amber-950/40 text-amber-400 border border-amber-800/40'
                  : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${usingMock ? 'bg-amber-400' : 'bg-emerald-400'} animate-pulse`} />
              {usingMock ? 'Mock Data' : 'Live Data'}
            </div>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-slate-100"
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 py-6">
        {/* Search section */}
        <div className="mb-6 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Stock Analysis
            </h2>
          </div>
          <SearchBar
            onSearch={handleSearch}
            loading={loading}
            error={error}
            hasApiKey={!!apiKey}
            currentTicker={ticker}
          />
        </div>

        {/* Company Header */}
        <div className="mb-6">
          <CompanyHeader data={financialData} />
        </div>

        {/* DCF Results */}
        <div className="mb-6">
          <DCFResults data={financialData} dcf={dcfResult} onExport={handleExport} />
        </div>

        {/* Financial Statements */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Financial Statements (Last 5 Years)
            </h2>
          </div>
          <FinancialStatements data={financialData} />
        </div>

        <footer className="mt-12 border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
          <p>
            FinAnalytics DCF Dashboard — Data provided by Financial Modeling Prep.
            Valuation estimates are for educational purposes only and do not constitute investment advice.
          </p>
        </footer>
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
      />

      {/* Full-screen loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-slate-700" />
              <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200">
                Fetching financial data...
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Pulling 5 years of income statements, balance sheets & cash flows
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
