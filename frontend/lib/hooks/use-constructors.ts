import { useQuery } from '@tanstack/react-query';
import { constructorsApi, Constructor, ConstructorStats, RaceResult } from '../api-client';

export function useConstructors(params?: { season?: number; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['constructors', params],
    queryFn: () => constructorsApi.getAll(params),
  });
}

export function useConstructor(constructorId: string) {
  return useQuery({
    queryKey: ['constructor', constructorId],
    queryFn: () => constructorsApi.getById(constructorId),
    enabled: !!constructorId,
  });
}

export function useConstructorResults(constructorId: string) {
  return useQuery({
    queryKey: ['constructor-results', constructorId],
    queryFn: () => constructorsApi.getResults(constructorId),
    enabled: !!constructorId,
  });
}

export function useConstructorStats(constructorId: string) {
  return useQuery({
    queryKey: ['constructor-stats', constructorId],
    queryFn: () => constructorsApi.getStats(constructorId),
    enabled: !!constructorId,
  });
}