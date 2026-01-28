import { useQuery } from '@tanstack/react-query';
import { constructorsApi } from '../api-client';

export function useConstructorsLineup(params: { season: number }) {
  return useQuery({
    queryKey: ['constructors-lineup', params.season],
    queryFn: () => constructorsApi.getLineup(params),
    staleTime: 0, // Always refetch when season changes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
}
