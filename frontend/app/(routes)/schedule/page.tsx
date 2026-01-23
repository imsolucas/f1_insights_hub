'use client';

import { useCurrentSeasonSchedule } from '../../../lib/hooks/use-races';
import { RaceCard } from '../../_components/race-card';
import { LoadingSkeleton, CardSkeleton } from '../../_components/loading-skeleton';
import { ErrorState } from '../../_components/error-state';

export default function SchedulePage() {
  const { data, isLoading, error, refetch } = useCurrentSeasonSchedule();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Race Schedule</h1>

      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message="Failed to load race schedule" onRetry={() => refetch()} />
      ) : data?.races && data.races.length > 0 ? (
        <div className="space-y-4">
          {data.races.map((race) => (
            <RaceCard key={race.id} race={race} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No races found</p>
      )}
    </div>
  );
}