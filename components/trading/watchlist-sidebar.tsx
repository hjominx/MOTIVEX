'use client';

import { useState, useMemo } from 'react';
import { useTradingStore } from '@/lib/stores/trading-store';
import { usePriceFormatter } from '@/hooks/use-market-data';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KRX_STOCKS, US_STOCKS, CRYPTO_LIST } from '@/lib/services/market-data';
import { Search } from 'lucide-react';
import type { MarketType } from '@/types/trading';

const TABS = [
  { key: 'krx',    label: '한국' },
  { key: 'us',     label: '미국' },
  { key: 'crypto', label: '코인' },
] as const;

function StockRow({
  symbol, name, market, onClick, isSelected,
}: {
  symbol: string; name: string; market: MarketType;
  onClick: () => void; isSelected: boolean;
}) {
  const tickers = useTradingStore((s) => s.tickers);
  const ticker = tickers[symbol];
  const { formatPrice } = usePriceFormatter();

  const price = ticker?.price ?? 0;
  const pct   = ticker?.changePercent ?? 0;
  const up    = pct >= 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
        isSelected
          ? 'bg-accent'
          : 'hover:bg-muted/60'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
          {name}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{symbol}</p>
      </div>
      <div className="text-right ml-3 shrink-0">
        <p className="text-[13px] font-semibold tabular-nums text-foreground">
          {formatPrice(price, market)}
        </p>
        <p className={`text-[11px] font-medium tabular-nums mt-0.5 ${up ? 'text-gain' : 'text-loss'}`}>
          {up ? '+' : ''}{pct.toFixed(2)}%
        </p>
      </div>
    </button>
  );
}

export function WatchlistSidebar() {
  const { selectedSymbol, setSelectedSymbol, sidebarOpen } = useTradingStore();
  const [query, setQuery]     = useState('');
  const [tab, setTab]         = useState<'krx' | 'us' | 'crypto'>('krx');

  const stocks = useMemo(() => {
    const all = tab === 'krx' ? KRX_STOCKS : tab === 'us' ? US_STOCKS : CRYPTO_LIST;
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [tab, query]);

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-8 text-[13px] bg-muted/60 border-transparent focus:border-border focus:bg-white rounded-lg"
          />
        </div>
      </div>

      {/* Tabs — Apple segmented control style */}
      <div className="flex gap-1 p-2 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-1 text-[12px] font-medium rounded-md transition-colors ${
              tab === t.key
                ? 'bg-white text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {stocks.map((s) => (
            <StockRow
              key={s.symbol}
              symbol={s.symbol}
              name={s.name}
              market={s.market}
              onClick={() => setSelectedSymbol(s.symbol, s.market)}
              isSelected={selectedSymbol === s.symbol}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
