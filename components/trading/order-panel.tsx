'use client';

import { useState, useMemo } from 'react';
import { useTradingStore, useSelectedTicker } from '@/lib/stores/trading-store';
import { usePriceFormatter } from '@/hooks/use-market-data';
import { getCurrencySymbol } from '@/lib/services/market-data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { OrderType, OrderSide } from '@/types/trading';

const ORDER_TYPES: { value: OrderType; label: string }[] = [
  { value: 'limit',      label: '지정가' },
  { value: 'market',     label: '시장가' },
  { value: 'stop',       label: '스탑' },
  { value: 'stop_limit', label: '스탑지정가' },
];

export function OrderPanel() {
  const { selectedSymbol, selectedMarket, orderPanelOpen } = useTradingStore();
  const ticker = useSelectedTicker();
  const { formatPrice } = usePriceFormatter();

  const [side, setSide]           = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const [price, setPrice]         = useState('');
  const [quantity, setQuantity]   = useState('');
  const [pct, setPct]             = useState([0]);
  const [submitting, setSubmitting] = useState(false);

  const effectivePrice = useMemo(() => {
    if (orderType === 'market') return ticker?.price ?? 0;
    return parseFloat(price) || ticker?.price || 0;
  }, [price, ticker?.price, orderType]);

  const total      = useMemo(() => effectivePrice * (parseFloat(quantity) || 0), [effectivePrice, quantity]);
  const feeRate    = selectedMarket === 'krx' ? 0.00015 : selectedMarket === 'crypto' ? 0.001 : 0.0025;
  const commission = total * feeRate;
  const currency   = getCurrencySymbol(selectedMarket ?? 'krx');

  async function handleSubmit() {
    if (!selectedSymbol || !selectedMarket || !quantity) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    setQuantity('');
    setPct([0]);
  }

  if (!orderPanelOpen) return null;

  return (
    <div className="w-full panel-surface rounded-2xl flex flex-col overflow-hidden shrink-0 shadow-[0_18px_48px_rgba(17,24,39,0.05)]">
      {/* Side toggle */}
      <div className="flex m-3 mb-0 rounded-xl overflow-hidden border border-border/80 bg-white/70 shadow-[0_8px_24px_rgba(17,24,39,0.03)]">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors ${
            side === 'buy'
              ? 'bg-motivex-navy text-white'
              : 'bg-transparent text-muted-foreground hover:text-motivex-navy'
          }`}
        >
          매수
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 text-[12px] font-semibold uppercase tracking-[0.14em] transition-colors ${
            side === 'sell'
              ? 'bg-loss text-white'
              : 'bg-transparent text-muted-foreground hover:text-motivex-navy'
          }`}
        >
          매도
        </button>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {/* Symbol */}
        <div className="text-center py-1">
          {selectedSymbol ? (
            <>
              <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-motivex-navy">{selectedSymbol}</p>
              <p className="text-[13px] tabular-nums text-muted-foreground mt-1.5">
                {currency}{formatPrice(ticker?.price ?? 0, selectedMarket ?? 'krx')}
              </p>
            </>
          ) : (
            <p className="text-[13px] text-muted-foreground">종목을 선택하세요</p>
          )}
        </div>

        {/* Order type */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">주문 유형</label>
          <Select value={orderType} onValueChange={(v) => setOrderType(v as OrderType)}>
            <SelectTrigger className="h-9 text-[13px] bg-white/70 border-border/80 rounded-xl shadow-[0_8px_18px_rgba(17,24,39,0.03)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {ORDER_TYPES.map(t => (
                <SelectItem key={t.value} value={t.value} className="text-[13px]">{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        {orderType !== 'market' && (
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">가격</label>
            <Input
              type="number"
              placeholder={String(ticker?.price ?? '')}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-9 text-[13px] tabular-nums bg-white/70 border-border/80 rounded-xl focus:bg-white shadow-[0_8px_18px_rgba(17,24,39,0.03)]"
            />
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-1">수량</label>
          <Input
            type="number"
            placeholder="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-9 text-[13px] tabular-nums bg-white/70 border-border/80 rounded-xl focus:bg-white shadow-[0_8px_18px_rgba(17,24,39,0.03)]"
          />
        </div>

        {/* Percent slider */}
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-2">
            <span className="uppercase tracking-[0.14em]">비중</span><span className="font-medium text-motivex-navy">{pct[0]}%</span>
          </div>
          <Slider
            value={pct}
            onValueChange={setPct}
            max={100} step={5}
            className="[&_.slider-thumb]:w-4 [&_.slider-thumb]:h-4"
          />
          <div className="flex justify-between mt-1">
            {[25, 50, 75, 100].map(p => (
              <button
                key={p}
                onClick={() => setPct([p])}
                className="text-[11px] text-muted-foreground hover:text-motivex-navy transition-colors"
              >
                {p}%
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {total > 0 && (
          <div className="rounded-xl bg-white/70 p-3 space-y-1.5 border border-border/60 shadow-[0_8px_24px_rgba(17,24,39,0.03)]">
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">총 금액</span>
              <span className="font-semibold tabular-nums">{currency}{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[12px]">
              <span className="text-muted-foreground">수수료</span>
              <span className="tabular-nums text-muted-foreground">{currency}{commission.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="p-3 pt-0">
        <Button
          onClick={handleSubmit}
          disabled={submitting || !selectedSymbol || !quantity}
          className={`w-full h-10 rounded-xl text-[13px] font-semibold tracking-[0.08em] uppercase text-white transition-colors disabled:opacity-40 ${
            side === 'buy'
              ? 'bg-motivex-navy hover:bg-motivex-navy/95'
              : 'bg-loss hover:bg-loss/90'
          }`}
        >
          {submitting ? '처리 중...' : side === 'buy' ? '매수하기' : '매도하기'}
        </Button>
      </div>
    </div>
  );
}
