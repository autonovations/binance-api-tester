import { useQuery } from '@tanstack/react-query';
import { fetchKlines } from '../api/binanceApi';
import type { KlineInterval } from '../types/binance';

export function useBinanceKlines(
  symbol: string,
  interval: KlineInterval,
  limit: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: ['klines', symbol, interval, limit],
    queryFn: () => fetchKlines(symbol, interval, limit),
    enabled: enabled && !!symbol,
    retry: false,
    staleTime: 0,
  });
}
