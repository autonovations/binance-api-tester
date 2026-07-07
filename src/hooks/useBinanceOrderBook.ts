import { useQuery } from '@tanstack/react-query';
import { fetchOrderBook } from '../api/binanceApi';

export function useBinanceOrderBook(symbol: string, limit: number, enabled: boolean) {
  return useQuery({
    queryKey: ['orderBook', symbol, limit],
    queryFn: () => fetchOrderBook(symbol, limit),
    enabled: enabled && !!symbol,
    retry: false,
    staleTime: 0,
  });
}
