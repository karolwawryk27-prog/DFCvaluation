import type { FinancialData } from '@/types';
import { formatCurrency, formatPrice } from '@/lib/dcfEngine';
import { Building2, Globe, User, TrendingUp, BarChart3 } from 'lucide-react';

interface CompanyHeaderProps {
  data: FinancialData;
}

export default function CompanyHeader({ data }: CompanyHeaderProps) {
  const { profile } = data;

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800/80 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-2xl font-bold text-white shadow-lg shadow-blue-900/30">
            {profile.symbol.slice(0, 2)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{profile.companyName}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <span className="rounded bg-slate-700/60 px-2 py-0.5 font-mono font-semibold text-blue-400">
                  {profile.symbol}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5" />
                {profile.exchange}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {profile.sector} • {profile.industry}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-slate-500">Current Price</div>
            <div className="text-2xl font-bold text-slate-100">
              {formatPrice(profile.price)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-slate-500">Market Cap</div>
            <div className="text-2xl font-bold text-slate-100">
              {formatCurrency(profile.mktCap)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wider text-slate-500">Shares Out.</div>
            <div className="text-2xl font-bold text-slate-100">
              {formatCurrency(profile.sharesOutstanding)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-6 border-t border-slate-700/50 pt-4 text-xs text-slate-400">
        {profile.ceo && (
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-slate-500" />
            CEO: {profile.ceo}
          </span>
        )}
        {profile.website && (
          <span className="flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-slate-500" />
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              {profile.website.replace(/^https?:\/\//, '')}
            </a>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
          Currency: {profile.currency}
        </span>
      </div>
    </div>
  );
}
