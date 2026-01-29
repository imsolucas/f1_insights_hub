'use client';

import Image from 'next/image';
import { useCurrentSeasonSchedule } from '../../../lib/hooks/use-races';
import { RaceCard } from '../../_components/race-card';
import { CardSkeleton } from '../../_components/loading-skeleton';
import { ErrorState } from '../../_components/error-state';

export default function SchedulePage() {
  const { data, isLoading, error, refetch } = useCurrentSeasonSchedule();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <h1 
          className="text-4xl font-extrabold text-foreground uppercase tracking-wide italic"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          F1 Race Schedule
        </h1>
      </div>

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