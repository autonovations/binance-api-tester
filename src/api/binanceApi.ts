import type { AxiosResponse } from 'axios';
import axiosClient from './axiosClient';
import type {
  ServerTimeResponse,
  ExchangeInfoResponse,
  OrderBookResponse,
  Trade,
  KlineRaw,
  TickerPrice,
  Ticker24hr,
  BookTicker,
  KlineInterval,
} from '../types/binance';

// ── Helper to extract latency from response ──────────────────────────────────
type ResponseWithLatency<T> = AxiosResponse<T> & { latencyMs?: number };

// ─── 1. Ping ──────────────────────────────────────────────────────────────────
export async function fetchPing(): Promise<{ latencyMs: number }> {
  const start = Date.now();
  await axiosClient.get('/api/v3/ping');
  return { latencyMs: Date.now() - start };
}

// ─── 2. Server Time ───────────────────────────────────────────────────────────
export async function fetchServerTime(): Promise<ServerTimeResponse & { latencyMs: number }> {
  const response = await axiosClient.get<ServerTimeResponse>('/api/v3/time') as ResponseWithLatency<ServerTimeResponse>;
  return { ...response.data, latencyMs: response.latencyMs ?? 0 };
}

// ─── 3. Exchange Info ──────────────────────────────────────────────────────────
export async function fetchExchangeInfo(): Promise<ExchangeInfoResponse> {
  const response = await axiosClient.get<ExchangeInfoResponse>('/api/v3/exchangeInfo');
  return response.data;
}

// ─── 4. Order Book ────────────────────────────────────────────────────────────
export async function fetchOrderBook(
  symbol: string,
  limit: number = 20
): Promise<OrderBookResponse> {
  const response = await axiosClient.get<OrderBookResponse>('/api/v3/depth', {
    params: { symbol: symbol.toUpperCase(), limit },
  });
  return response.data;
}

// ─── 5. Recent Trades ─────────────────────────────────────────────────────────
export async function fetchRecentTrades(
  symbol: string,
  limit: number = 20
): Promise<Trade[]> {
  const response = await axiosClient.get<Trade[]>('/api/v3/trades', {
    params: { symbol: symbol.toUpperCase(), limit },
  });
  return response.data;
}

// ─── 6. Klines ────────────────────────────────────────────────────────────────
export async function fetchKlines(
  symbol: string,
  interval: KlineInterval,
  limit: number = 100
): Promise<KlineRaw[]> {
  const response = await axiosClient.get<KlineRaw[]>('/api/v3/klines', {
    params: { symbol: symbol.toUpperCase(), interval, limit },
  });
  return response.data;
}

// ─── 7. Ticker Price ──────────────────────────────────────────────────────────
export async function fetchTickerPrice(symbol?: string): Promise<TickerPrice | TickerPrice[]> {
  const response = await axiosClient.get<TickerPrice | TickerPrice[]>('/api/v3/ticker/price', {
    params: symbol ? { symbol: symbol.toUpperCase() } : {},
  });
  return response.data;
}

// ─── 8. 24hr Ticker Stats ─────────────────────────────────────────────────────
export async function fetchTicker24hr(symbol: string): Promise<Ticker24hr> {
  const response = await axiosClient.get<Ticker24hr>('/api/v3/ticker/24hr', {
    params: { symbol: symbol.toUpperCase() },
  });
  return response.data;
}

// ─── 9. Book Ticker ───────────────────────────────────────────────────────────
export async function fetchBookTicker(symbol: string): Promise<BookTicker> {
  const response = await axiosClient.get<BookTicker>('/api/v3/ticker/bookTicker', {
    params: { symbol: symbol.toUpperCase() },
  });
  return response.data;
}
