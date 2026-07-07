import { useQuery } from '@tanstack/react-query';
import { fetchTickerPrice } from '../api/binanceApi';

export function useBinanceTickerPrice(symbol: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['tickerPrice', symbol],
    queryFn: () => fetchTickerPrice(symbol),
    enabled,
    retry: false,
    staleTime: 0,
  });
}
