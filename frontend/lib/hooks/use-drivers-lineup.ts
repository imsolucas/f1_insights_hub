import { useQuery } from '@tanstack/react-query';
import { driversApi } from '../api-client';

export function useDriversLineup(params: { season: number }) {
  return useQuery({
    queryKey: ['drivers-lineup', params.season],
    queryFn: () => driversApi.getLineup(params),
    staleTime: 0, // Always refetch when season changes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
