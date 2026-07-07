import { useQuery } from '@tanstack/react-query';
import { fetchPing } from '../api/binanceApi';

export function useBinancePing(enabled: boolean) {
  return useQuery({
    queryKey: ['ping'],
    queryFn: fetchPing,
    enabled,
    retry: false,
    staleTime: 0,
  });
}
