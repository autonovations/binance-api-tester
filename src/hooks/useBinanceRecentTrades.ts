import { useQuery } from '@tanstack/react-query';
import { fetchRecentTrades } from '../api/binanceApi';

export function useBinanceRecentTrades(symbol: string, limit: number, enabled: boolean) {
  return useQuery({
    queryKey: ['recentTrades', symbol, limit],
    queryFn: () => fetchRecentTrades(symbol, limit),
    enabled: enabled && !!symbol,
    retry: false,
    staleTime: 0,
  });
}
