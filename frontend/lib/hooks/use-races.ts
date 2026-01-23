import { useQuery } from '@tanstack/react-query';
import { racesApi, Race, RaceResult, QualifyingResult } from '../api-client';

export function useRaces(params?: { season?: number; limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['races', params],
    queryFn: () => racesApi.getAll(params),
  });
}

export function useRace(raceId: string) {
  return useQuery({
    queryKey: ['race', raceId],
    queryFn: () => racesApi.getById(raceId),
    enabled: !!raceId,
  });
}

export function useRaceResults(raceId: string) {
  return useQuery({
    queryKey: ['race-results', raceId],
    queryFn: () => racesApi.getResults(raceId),
    enabled: !!raceId,
  });
}

export function useQualifyingResults(raceId: string) {
  return useQuery({
    queryKey: ['qualifying-results', raceId],
    queryFn: () => racesApi.getQualifying(raceId),
    enabled: !!raceId,
  });
}

export function useCurrentSeasonSchedule() {
  return useQuery({
    queryKey: ['current-season-schedule'],
    queryFn: () => racesApi.getCurrentSchedule(),
    staleTime: 60 * 60 * 1000, // 1 hour - schedule doesn't change often
  });
}