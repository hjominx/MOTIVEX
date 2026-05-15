import type { TickerData, OrderBook, CandleData, MarketType, ChartInterval } from '@/types/trading';

// 모의 시세 데이터 생성 (베타 버전용)
// 실제 구현 시 증권사 API 또는 외부 데이터 제공자 연동

// 한국 주식 목록
export const KRX_STOCKS = [
  { symbol: '005930', name: '삼성전자', market: 'krx' as MarketType },
  { symbol: '000660', name: 'SK하이닉스', market: 'krx' as MarketType },
  { symbol: '035420', name: 'NAVER', market: 'krx' as MarketType },
  { symbol: '035720', name: '카카오', market: 'krx' as MarketType },
  { symbol: '051910', name: 'LG화학', market: 'krx' as MarketType },
  { symbol: '006400', name: '삼성SDI', market: 'krx' as MarketType },
  { symbol: '373220', name: 'LG에너지솔루션', market: 'krx' as MarketType },
  { symbol: '005380', name: '현대차', market: 'krx' as MarketType },
  { symbol: '000270', name: '기아', market: 'krx' as MarketType },
  { symbol: '068270', name: '셀트리온', market: 'krx' as MarketType },
];

// 미국 주식 목록
export const US_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'nasdaq' as MarketType },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'nasdaq' as MarketType },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'nasdaq' as MarketType },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'nasdaq' as MarketType },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'nasdaq' as MarketType },
  { symbol: 'META', name: 'Meta Platforms', market: 'nasdaq' as MarketType },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'nasdaq' as MarketType },
  { symbol: 'JPM', name: 'JPMorgan Chase', market: 'nyse' as MarketType },
  { symbol: 'V', name: 'Visa Inc.', market: 'nyse' as MarketType },
  { symbol: 'JNJ', name: 'Johnson & Johnson', market: 'nyse' as MarketType },
];

// 암호화폐 목록
export const CRYPTO_LIST = [
  { symbol: 'BTC', name: 'Bitcoin', market: 'crypto' as MarketType },
  { symbol: 'ETH', name: 'Ethereum', market: 'crypto' as MarketType },
  { symbol: 'BNB', name: 'BNB', market: 'crypto' as MarketType },
  { symbol: 'XRP', name: 'Ripple', market: 'crypto' as MarketType },
  { symbol: 'SOL', name: 'Solana', market: 'crypto' as MarketType },
  { symbol: 'ADA', name: 'Cardano', market: 'crypto' as MarketType },
  { symbol: 'DOGE', name: 'Dogecoin', market: 'crypto' as MarketType },
  { symbol: 'DOT', name: 'Polkadot', market: 'crypto' as MarketType },
  { symbol: 'MATIC', name: 'Polygon', market: 'crypto' as MarketType },
  { symbol: 'AVAX', name: 'Avalanche', market: 'crypto' as MarketType },
];

// 기본 가격 (모의 데이터)
const BASE_PRICES: Record<string, number> = {
  // 한국 주식 (원)
  '005930': 72500,
  '000660': 128000,
  '035420': 205000,
  '035720': 48500,
  '051910': 385000,
  '006400': 412000,
  '373220': 385000,
  '005380': 235000,
  '000270': 98500,
  '068270': 185000,
  // 미국 주식 (달러)
  'AAPL': 198.50,
  'MSFT': 425.80,
  'GOOGL': 175.20,
  'AMZN': 185.60,
  'NVDA': 875.30,
  'META': 505.40,
  'TSLA': 248.70,
  'JPM': 198.30,
  'V': 285.60,
  'JNJ': 158.40,
  // 암호화폐 (달러)
  'BTC': 67450,
  'ETH': 3520,
  'BNB': 605,
  'XRP': 0.52,
  'SOL': 178.50,
  'ADA': 0.45,
  'DOGE': 0.125,
  'DOT': 7.85,
  'MATIC': 0.58,
  'AVAX': 38.50,
};

// 랜덤 변동률 생성
function getRandomChange(maxPercent: number = 0.5): number {
  return (Math.random() - 0.5) * 2 * maxPercent;
}

// 실시간 시세 생성
export function generateTickerData(symbol: string, market: MarketType): TickerData {
  const basePrice = BASE_PRICES[symbol] || 100;
  const changePercent = getRandomChange(3);
  const change = basePrice * (changePercent / 100);
  const price = basePrice + change;
  
  const allStocks = [...KRX_STOCKS, ...US_STOCKS, ...CRYPTO_LIST];
  const stock = allStocks.find(s => s.symbol === symbol);
  
  return {
    symbol,
    market,
    name: stock?.name || symbol,
    price: Number(price.toFixed(market === 'krx' ? 0 : 2)),
    change: Number(change.toFixed(market === 'krx' ? 0 : 2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 10000000),
    high: Number((price * 1.02).toFixed(market === 'krx' ? 0 : 2)),
    low: Number((price * 0.98).toFixed(market === 'krx' ? 0 : 2)),
    open: basePrice,
    previousClose: basePrice,
    timestamp: Date.now(),
  };
}

// 호가 데이터 생성
export function generateOrderBook(symbol: string, market: MarketType, currentPrice: number): OrderBook {
  const asks: { price: number; quantity: number; total: number }[] = [];
  const bids: { price: number; quantity: number; total: number }[] = [];
  
  const tickSize = market === 'krx' ? (currentPrice > 50000 ? 100 : currentPrice > 10000 ? 50 : 10) : 0.01;
  
  // 매도호가 (현재가 위로 10개)
  for (let i = 1; i <= 10; i++) {
    const price = currentPrice + (tickSize * i);
    const quantity = Math.floor(Math.random() * 10000) + 100;
    asks.push({
      price: Number(price.toFixed(market === 'krx' ? 0 : 2)),
      quantity,
      total: quantity,
    });
  }
  
  // 매수호가 (현재가 아래로 10개)
  for (let i = 1; i <= 10; i++) {
    const price = currentPrice - (tickSize * i);
    const quantity = Math.floor(Math.random() * 10000) + 100;
    bids.push({
      price: Number(price.toFixed(market === 'krx' ? 0 : 2)),
      quantity,
      total: quantity,
    });
  }
  
  return {
    symbol,
    market,
    asks,
    bids,
    timestamp: Date.now(),
  };
}

// 캔들 데이터 생성
export function generateCandleData(
  symbol: string, 
  interval: ChartInterval, 
  count: number = 100
): CandleData[] {
  const candles: CandleData[] = [];
  const basePrice = BASE_PRICES[symbol] || 100;
  let currentPrice = basePrice;
  
  const intervalMs: Record<ChartInterval, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
  };
  
  const now = Date.now();
  const ms = intervalMs[interval];
  
  for (let i = count - 1; i >= 0; i--) {
    const time = Math.floor((now - ms * i) / 1000);
    const volatility = basePrice * 0.02;
    
    const open = currentPrice;
    const change1 = (Math.random() - 0.5) * volatility;
    const change2 = (Math.random() - 0.5) * volatility;
    const change3 = (Math.random() - 0.5) * volatility;
    
    const prices = [open, open + change1, open + change2, open + change3];
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const close = prices[3];
    
    currentPrice = close;
    
    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
    });``
  }
  
  return candles;
}

// 모든 종목의 시세 데이터 생성
export function generateAllTickers(): Record<string, TickerData> {
  const tickers: Record<string, TickerData> = {};
  
  [...KRX_STOCKS, ...US_STOCKS, ...CRYPTO_LIST].forEach(stock => {
    tickers[stock.symbol] = generateTickerData(stock.symbol, stock.market);
  });
  
  return tickers;
}

// 가격 포맷팅
export function formatPrice(price: number, market: MarketType): string {
  if (market === 'krx') {
    return new Intl.NumberFormat('ko-KR').format(Math.round(price));
  }
  
  if (market === 'crypto' && price < 1) {
    return price.toFixed(4);
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// 변동률 포맷팅
export function formatChange(change: number, changePercent: number, market: MarketType): string {
  const sign = change >= 0 ? '+' : '';
  const priceStr = formatPrice(Math.abs(change), market);
  return `${sign}${change >= 0 ? '' : '-'}${priceStr} (${sign}${changePercent.toFixed(2)}%)`;
}

// 거래량 포맷팅
export function formatVolume(volume: number): string {
  if (volume >= 1000000000) {
    return (volume / 1000000000).toFixed(2) + 'B';
  }
  if (volume >= 1000000) {
    return (volume / 1000000).toFixed(2) + 'M';
  }
  if (volume >= 1000) {
    return (volume / 1000).toFixed(2) + 'K';
  }
  return volume.toString();
}

// 통화 기호
export function getCurrencySymbol(market: MarketType): string {
  switch (market) {
    case 'krx':
      return '₩';
    case 'nyse':
    case 'nasdaq':
    case 'crypto':
    case 'options':
      return '$';
    default:
      return '';
  }
}
