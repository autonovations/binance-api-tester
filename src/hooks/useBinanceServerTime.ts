import { useQuery } from '@tanstack/react-query';
import { fetchServerTime } from '../api/binanceApi';

export function useBinanceServerTime(enabled: boolean) {
  return useQuery({
    queryKey: ['serverTime'],
    queryFn: fetchServerTime,
    enabled,
    retry: false,
    staleTime: 0,
  });
}
