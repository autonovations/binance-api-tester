import { useQuery } from '@tanstack/react-query';
import { fetchBookTicker } from '../api/binanceApi';

export function useBinanceBookTicker(symbol: string, enabled: boolean) {
  return useQuery({
    queryKey: ['bookTicker', symbol],
    queryFn: () => fetchBookTicker(symbol),
    enabled: enabled && !!symbol,
    retry: false,
    staleTime: 0,
  });
}
