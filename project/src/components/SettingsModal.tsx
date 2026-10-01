import { useState } from 'react';
import { Settings, Key, X, Check, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  apiKey,
  onSave,
}: SettingsModalProps) {
  const [keyInput, setKeyInput] = useState(apiKey);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(keyInput.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">API Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Key className="h-4 w-4 text-blue-400" />
            Financial Modeling Prep API Key
          </label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Enter your FMP API key..."
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-100 placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Get a free API key from{' '}
            <a
              href="https://site.financialmodelingprep.com/register"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
            >
              Financial Modeling Prep
              <ExternalLink className="h-3 w-3" />
            </a>
            . The free tier provides up to 250 requests/day.
          </p>

          <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2">
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full ${
                apiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'
              }`}
            >
              <Check className="h-3 w-3" />
            </div>
            <span className="text-xs text-slate-400">
              {apiKey ? 'API key is set — live data is enabled' : 'No API key — using realistic mock data (AAPL)'}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}
