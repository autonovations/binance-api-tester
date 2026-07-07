import { useQuery } from '@tanstack/react-query';
import { fetchExchangeInfo } from '../api/binanceApi';

export function useBinanceExchangeInfo(enabled: boolean) {
  return useQuery({
    queryKey: ['exchangeInfo'],
    queryFn: fetchExchangeInfo,
    enabled,
    retry: false,
    staleTime: 60_000,
  });
}
