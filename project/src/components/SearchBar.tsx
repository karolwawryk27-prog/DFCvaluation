import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

interface SearchBarProps {
  onSearch: (ticker: string) => void;
  loading: boolean;
  error: string | null;
  hasApiKey: boolean;
  currentTicker: string;
}

export default function SearchBar({
  onSearch,
  loading,
  error,
  hasApiKey,
  currentTicker,
}: SearchBarProps) {
  const [input, setInput] = useState(currentTicker);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInput(currentTicker);
  }, [currentTicker]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = input.trim().toUpperCase();
    if (ticker) onSearch(ticker);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={hasApiKey ? 'Search ticker (e.g. AAPL, MSFT, GOOGL)...' : 'Enter API key in Settings for live data — currently showing mock AAPL data'}
            className="w-full rounded-xl border border-slate-700 bg-slate-800/80 py-3 pl-12 pr-32 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            {loading ? 'Loading...' : 'Analyze'}
          </button>
        </div>
      </form>
      {error && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-red-800/50 bg-red-950/40 px-3 py-2 text-sm text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
