import { useQuery } from '@tanstack/react-query';
import { fetchTicker24hr } from '../api/binanceApi';

export function useBinanceTicker24hr(symbol: string, enabled: boolean) {
  return useQuery({
    queryKey: ['ticker24hr', symbol],
    queryFn: () => fetchTicker24hr(symbol),
    enabled: enabled && !!symbol,
    retry: false,
    staleTime: 0,
  });
}
