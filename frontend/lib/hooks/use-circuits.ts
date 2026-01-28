import { useQuery } from '@tanstack/react-query';
import { circuitsApi } from '../api-client';

export function useCircuits() {
  return useQuery({
    queryKey: ['circuits'],
    queryFn: () => circuitsApi.getAll(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - circuits rarely change
  });
}

export function useCircuit(circuitId: string) {
  return useQuery({
    queryKey: ['circuit', circuitId],
    queryFn: () => circuitsApi.getById(circuitId),
    enabled: !!circuitId,
  });
}

export function useCircuitRaces(circuitId: string) {
  return useQuery({
    queryKey: ['circuit-races', circuitId],
    queryFn: () => circuitsApi.getRaces(circuitId),
    enabled: !!circuitId,
  });
}