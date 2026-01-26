import { useQuery } from '@tanstack/react-query';
import { driversApi, Driver, DriverStats, RaceResult } from '../api-client';

export function useDrivers(params?: { season?: number; limit?: number; offset?: number; active?: boolean }) {
  return useQuery({
    queryKey: ['drivers', params],
    queryFn: () => driversApi.getAll(params),
  });
}

export function useDriver(driverId: string) {
  return useQuery({
    queryKey: ['driver', driverId],
    queryFn: () => driversApi.getById(driverId),
    enabled: !!driverId,
  });
}

export function useDriverResults(driverId: string) {
  return useQuery({
    queryKey: ['driver-results', driverId],
    queryFn: () => driversApi.getResults(driverId),
    enabled: !!driverId,
  });
}

export function useDriverStats(driverId: string) {
  return useQuery({
    queryKey: ['driver-stats', driverId],
    queryFn: () => driversApi.getStats(driverId),
    enabled: !!driverId,
  });
}