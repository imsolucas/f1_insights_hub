'use client';

import Link from 'next/link';
import { useCurrentSeasonSchedule } from '../lib/hooks/use-races';
import { RaceCard } from './_components/race-card';
import { CardSkeleton } from './_components/loading-skeleton';
import { ErrorState } from './_components/error-state';

export default function Home() {
  const { data, isLoading, error, refetch } = useCurrentSeasonSchedule();

  const upcomingRaces = data?.races?.filter((race) => new Date(race.date) >= new Date()).slice(0, 3) || [];
  const recentRaces = data?.races?.filter((race) => new Date(race.date) < new Date()).slice(0, 3) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">F1 Insight Hub</h1>
        <p className="text-lg text-muted-foreground">
          Explore Formula 1 race data, statistics, and insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground">Upcoming Races</h2>
            <Link href="/schedule" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : error ? (
            <ErrorState message="Failed to load upcoming races" onRetry={() => refetch()} />
          ) : upcomingRaces.length > 0 ? (
            <div className="space-y-4">
              {upcomingRaces.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No upcoming races</p>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-foreground">Recent Races</h2>
            <Link href="/schedule" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : error ? (
            <ErrorState message="Failed to load recent races" onRetry={() => refetch()} />
          ) : recentRaces.length > 0 ? (
            <div className="space-y-4">
              {recentRaces.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent races</p>
          )}
        </section>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/drivers"
          className="p-6 border border-border rounded-lg hover:border-primary transition-colors bg-card"
        >
          <h3 className="text-xl font-semibold text-foreground mb-2">Drivers</h3>
          <p className="text-muted-foreground">Browse driver profiles and statistics</p>
        </Link>
        <Link
          href="/teams"
          className="p-6 border border-border rounded-lg hover:border-primary transition-colors bg-card"
        >
          <h3 className="text-xl font-semibold text-foreground mb-2">Teams</h3>
          <p className="text-muted-foreground">Explore constructor teams and their performance</p>
        </Link>
        <Link
          href="/circuits"
          className="p-6 border border-border rounded-lg hover:border-primary transition-colors bg-card"
        >
          <h3 className="text-xl font-semibold text-foreground mb-2">Circuits</h3>
          <p className="text-muted-foreground">Discover F1 circuits around the world</p>
        </Link>
      </div>
    </div>
  );
}