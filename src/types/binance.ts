// ─── Ping ─────────────────────────────────────────────────────────────────────
export interface PingResponse {
  latencyMs: number;
}

// ─── Server Time ───────────────────────────────────────────────────────────────
export interface ServerTimeResponse {
  serverTime: number;
}

// ─── Exchange Info ──────────────────────────────────────────────────────────────
export interface RateLimit {
  rateLimitType: string;
  interval: string;
  intervalNum: number;
  limit: number;
}

export interface Filter {
  filterType: string;
  [key: string]: string | number | boolean;
}

export interface Symbol {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quoteAssetPrecision: number;
  orderTypes: string[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  isSpotTradingAllowed: boolean;
  isMarginTradingAllowed: boolean;
  filters: Filter[];
  permissions: string[];
}

export interface ExchangeInfoResponse {
  timezone: string;
  serverTime: number;
  rateLimits: RateLimit[];
  symbols: Symbol[];
}

// ─── Order Book ─────────────────────────────────────────────────────────────────
export interface OrderBookResponse {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

// ─── Recent Trades ──────────────────────────────────────────────────────────────
export interface Trade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

// ─── Klines / Candlestick ───────────────────────────────────────────────────────
export type KlineRaw = [
  number,  // Open time
  string,  // Open
  string,  // High
  string,  // Low
  string,  // Close
  string,  // Volume
  number,  // Close time
  string,  // Quote asset volume
  number,  // Number of trades
  string,  // Taker buy base asset volume
  string,  // Taker buy quote asset volume
  string   // Ignore
];

export interface Kline {
  openTime: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  quoteVolume: number;
  trades: number;
  takerBuyBaseVol: number;
  takerBuyQuoteVol: number;
}

export type KlineInterval =
  | '1s' | '1m' | '3m' | '5m' | '15m' | '30m'
  | '1h' | '2h' | '4h' | '6h' | '8h' | '12h'
  | '1d' | '3d' | '1w' | '1M';

// ─── Ticker Price ────────────────────────────────────────────────────────────────
export interface TickerPrice {
  symbol: string;
  price: string;
}

// ─── 24hr Ticker ────────────────────────────────────────────────────────────────
export interface Ticker24hr {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

// ─── Book Ticker ────────────────────────────────────────────────────────────────
export interface BookTicker {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
}

// ─── Endpoint Config ─────────────────────────────────────────────────────────────
export interface EndpointParam {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select';
  required: boolean;
  options?: string[];
  defaultValue?: string | number;
  placeholder?: string;
}

export interface EndpointConfig {
  id: string;
  label: string;
  path: string;
  method: 'GET';
  description: string;
  params: EndpointParam[];
  category: string;
}

// ─── API Error ───────────────────────────────────────────────────────────────────
export interface BinanceApiError {
  code: number;
  msg: string;
}
