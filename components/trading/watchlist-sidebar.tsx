'use client';

import { useState, useMemo, useEffect } from 'react';
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
  symbol, name, market, onClick, isSelected, isFocused,
}: {
  symbol: string; name: string; market: MarketType;
  onClick: () => void; isSelected: boolean; isFocused?: boolean;
}) {
  const tickers = useTradingStore((s) => s.tickers);
  const ticker = tickers[symbol];
  const { formatPrice } = usePriceFormatter();

  const price = ticker?.price ?? 0;
  const pct   = ticker?.changePercent ?? 0;
  const up    = pct >= 0;

  return (
    <button
      id={`stock-row-${symbol}`}
      role="option"
      aria-selected={isSelected}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors transform-gpu active:scale-[0.997] focus:outline-none focus-visible:ring-2 focus-visible:ring-motivex-navy/20 ${
        isSelected
          ? 'bg-motivex-navy/5 border-l-2 border-motivex-navy/20 rounded-r-md'
          : 'hover:bg-motivex-navy/5'
      } ${isFocused ? 'ring-2 ring-motivex-navy/20' : ''}`}
      tabIndex={0}
    >
      <div className="min-w-0 flex-1">
        <p className={`text-[13px] font-medium truncate ${isSelected ? 'text-motivex-navy' : 'text-foreground'}`}>
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
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const stocks = useMemo(() => {
    const all = tab === 'krx' ? KRX_STOCKS : tab === 'us' ? US_STOCKS : CRYPTO_LIST;
    if (!query) return all;
    const q = query.toLowerCase();
    return all.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  }, [tab, query]);

  useEffect(() => {
    if (focusedIndex === null) return;
    const s = stocks[focusedIndex];
    if (!s) return;
    const el = document.getElementById(`stock-row-${s.symbol}`);
    if (el) el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [focusedIndex, stocks]);

  if (!sidebarOpen) return null;

  return (
    <aside className="w-60 panel-surface flex flex-col shrink-0 rounded-2xl overflow-hidden">
      {/* Search */}
      <div className="p-2 border-b border-border/60 bg-white/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 h-7 text-[13px] bg-white/70 border border-border/70 focus:border-motivex-navy/20 focus:bg-white rounded-md shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_18px_rgba(17,24,39,0.03)]"
          />
        </div>
      </div>

      {/* Tabs — Apple segmented control style */}
      <div className="flex gap-1 p-2 border-b border-border/70 bg-white/55">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-1 text-[11px] font-medium uppercase tracking-[0.12em] rounded-md transition-colors ${
              tab === t.key
                ? 'bg-white text-motivex-navy shadow-sm'
                : 'text-muted-foreground hover:text-motivex-navy'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <ScrollArea className="flex-1">
        <div
          className="py-1"
          role="listbox"
          aria-label="관심종목 목록"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setFocusedIndex((i) => {
                const next = i === null ? 0 : Math.min(i + 1, stocks.length - 1);
                return next;
              });
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setFocusedIndex((i) => {
                const prev = i === null ? Math.max(stocks.length - 1, 0) : Math.max(i - 1, 0);
                return prev;
              });
            } else if (e.key === 'Enter') {
              if (focusedIndex !== null) {
                const s = stocks[focusedIndex];
                if (s) setSelectedSymbol(s.symbol, s.market);
              }
            }
          }}
        >
          {stocks.map((s, idx) => (
            <StockRow
              key={s.symbol}
              symbol={s.symbol}
              name={s.name}
              market={s.market}
              onClick={() => setSelectedSymbol(s.symbol, s.market)}
              isSelected={selectedSymbol === s.symbol}
              isFocused={focusedIndex === idx}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
