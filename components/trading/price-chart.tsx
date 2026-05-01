'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { useTradingStore, useSelectedTicker } from '@/lib/stores/trading-store';
import { usePriceFormatter } from '@/hooks/use-market-data';
import { generateCandleData, getCurrencySymbol } from '@/lib/services/market-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  Maximize2, 
  Settings, 
  BarChart2,
  CandlestickChart,
  LineChart
} from 'lucide-react';
import type { ChartInterval } from '@/types/trading';

const INTERVALS: { value: ChartInterval; label: string }[] = [
  { value: '1m', label: '1분' },
  { value: '5m', label: '5분' },
  { value: '15m', label: '15분' },
  { value: '1h', label: '1시간' },
  { value: '4h', label: '4시간' },
  { value: '1d', label: '일' },
  { value: '1w', label: '주' },
  { value: '1M', label: '월' },
];

export function PriceChart() {
  const { selectedSymbol, selectedMarket } = useTradingStore();
  const ticker = useSelectedTicker();
  const { formatPrice } = usePriceFormatter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interval, setInterval] = useState<ChartInterval>('1d');
  const [chartType, setChartType] = useState<'candle' | 'line'>('candle');

  // 캔들 데이터 생성
  const candleData = useMemo(() => {
    if (!selectedSymbol) return [];
    return generateCandleData(selectedSymbol, interval, 100);
  }, [selectedSymbol, interval]);

  // 캔들스틱 차트 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candleData.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 캔버스 크기 설정
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 76, bottom: 28, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 배경 지우기
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, width, height);

    // 가격 범위 계산
    const prices = candleData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;
    const priceScale = chartHeight / priceRange;

    // 캔들 너비 계산
    const candleWidth = Math.max(2, (chartWidth / candleData.length) * 0.7);
    const candleGap = chartWidth / candleData.length;

    // 그리드 라인 그리기
    ctx.strokeStyle = 'rgba(11, 31, 58, 0.08)';
    ctx.lineWidth = 1;
    
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight * i / gridLines);
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // 가격 레이블
      const price = maxPrice - (priceRange * i / gridLines);
      ctx.fillStyle = 'rgba(17, 24, 39, 0.45)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        formatPrice(price, selectedMarket || 'krx'),
        width - padding.right + 5,
        y + 3
      );
    }

    // 캔들 그리기
    candleData.forEach((candle, i) => {
      const x = padding.left + (i * candleGap) + (candleGap - candleWidth) / 2;
      const isUp = candle.close >= candle.open;
      
      // 색상
      const upColor = 'rgb(34, 197, 94)';
      const downColor = 'rgb(239, 68, 68)';
      const color = isUp ? upColor : downColor;

      // 심지 (고가-저가)
      const wickX = x + candleWidth / 2;
      const highY = padding.top + (maxPrice - candle.high) * priceScale;
      const lowY = padding.top + (maxPrice - candle.low) * priceScale;

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(wickX, highY);
      ctx.lineTo(wickX, lowY);
      ctx.stroke();

      // 몸통 (시가-종가)
      const openY = padding.top + (maxPrice - candle.open) * priceScale;
      const closeY = padding.top + (maxPrice - candle.close) * priceScale;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1, Math.abs(closeY - openY));

      ctx.fillStyle = color;
      ctx.fillRect(x, bodyTop, candleWidth, bodyHeight);
    });

    // 현재가 라인
    if (ticker) {
      const currentY = padding.top + (maxPrice - ticker.price) * priceScale;
      ctx.strokeStyle = ticker.changePercent >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(padding.left, currentY);
      ctx.lineTo(width - padding.right, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [candleData, selectedMarket, ticker, formatPrice]);

    if (!selectedSymbol) {
    return (
      <Card className="flex-1 flex items-center justify-center panel-surface border-border/50 rounded-2xl overflow-hidden">
        <div className="text-center text-muted-foreground">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>종목을 선택해주세요</p>
        </div>
      </Card>
    );
  }

  const isPositive = (ticker?.changePercent || 0) >= 0;
  const currency = getCurrencySymbol(selectedMarket || 'krx');

  return (
    <Card className="flex-1 flex flex-col panel-surface border-border/50 overflow-hidden rounded-2xl">
      {/* 헤더 */}
      <div className="p-3.5 border-b border-border/50 bg-white/55">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[22px] font-semibold tracking-[-0.04em] font-serif">{ticker?.name || selectedSymbol}</h2>
              <span className="text-[11px] text-muted-foreground uppercase tracking-[0.14em]">{selectedSymbol}</span>
            </div>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-3xl font-semibold font-mono tracking-[-0.03em]">
                {currency}{formatPrice(ticker?.price || 0, selectedMarket || 'krx')}
              </span>
              <span className={`flex items-center gap-1 text-base font-medium ${
                isPositive ? 'text-gain' : 'text-loss'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                {isPositive ? '+' : ''}{ticker?.changePercent?.toFixed(2) || '0.00'}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-motivex-navy/5">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-motivex-navy/5">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 시간 간격 선택 */}
        <div className="flex items-center gap-1 mt-3.5">
          <div className="flex items-center gap-1 mr-2 border-r border-border pr-2">
            <Button
              variant={chartType === 'candle' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => setChartType('candle')}
            >
              <CandlestickChart className="w-4 h-4" />
            </Button>
            <Button
              variant={chartType === 'line' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={() => setChartType('line')}
            >
              <LineChart className="w-4 h-4" />
            </Button>
          </div>
          
          {INTERVALS.map(({ value, label }) => (
            <Button
              key={value}
              variant={interval === value ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2 text-[11px] rounded-lg"
              onClick={() => setInterval(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* 차트 캔버스 */}
      <div className="flex-1 p-3.5 min-h-0 bg-[linear-gradient(180deg,rgba(255,253,248,0.45)_0%,rgba(255,255,255,0.05)_100%)]">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      {/* 거래 정보 */}
      <div className="px-4 py-3 border-t border-border/50 bg-white/55">
        <div className="grid grid-cols-4 gap-4 text-[11px]">
          <div>
            <span className="text-muted-foreground">시가</span>
            <div className="font-mono mt-0.5 tracking-[-0.02em]">
              {currency}{formatPrice(ticker?.open || 0, selectedMarket || 'krx')}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">고가</span>
            <div className="font-mono mt-0.5 text-gain tracking-[-0.02em]">
              {currency}{formatPrice(ticker?.high || 0, selectedMarket || 'krx')}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">저가</span>
            <div className="font-mono mt-0.5 text-loss tracking-[-0.02em]">
              {currency}{formatPrice(ticker?.low || 0, selectedMarket || 'krx')}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">거래량</span>
            <div className="font-mono mt-0.5 tracking-[-0.02em]">
              {((ticker?.volume || 0) / 1000000).toFixed(2)}M
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
