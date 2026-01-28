'use client';

import { use } from 'react';
import { useConstructor, useConstructorStats, useConstructorResults } from '../../../../lib/hooks/use-constructors';
import { ResultsTable } from '../../../_components/results-table';
import { LoadingSkeleton } from '../../../_components/loading-skeleton';
import { ErrorState } from '../../../_components/error-state';

export default function TeamDetailPage({ params }: { params: Promise<{ constructorId: string }> }) {
  const { constructorId } = use(params);
  const { data: constructorData, isLoading: constructorLoading, error: constructorError, refetch: constructorRefetch } = useConstructor(constructorId);
  const { data: statsData, isLoading: statsLoading } = useConstructorStats(constructorId);
  const { data: resultsData, isLoading: resultsLoading, error: resultsError, refetch: resultsRefetch } = useConstructorResults(constructorId);

  if (constructorLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (constructorError || !constructorData?.constructor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState message="Failed to load team details" onRetry={() => constructorRefetch()} />
      </div>
    );
  }

  const constructor = constructorData.constructor;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{constructor.name}</h1>
        <p className="text-lg text-muted-foreground">{constructor.nationality}</p>
      </div>

      {statsLoading ? (
        <LoadingSkeleton />
      ) : statsData ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 border border-border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground">Total Races</p>
            <p className="text-2xl font-bold text-foreground">{statsData.totalRaces}</p>
          </div>
          <div className="p-4 border border-border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground">Total Points</p>
            <p className="text-2xl font-bold text-foreground">{statsData.totalPoints}</p>
          </div>
          <div className="p-4 border border-border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground">Wins</p>
            <p className="text-2xl font-bold text-foreground">{statsData.wins}</p>
          </div>
          <div className="p-4 border border-border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground">Podiums</p>
            <p className="text-2xl font-bold text-foreground">{statsData.podiums}</p>
          </div>
        </div>
      ) : null}

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Recent Results</h2>
        {resultsLoading ? (
          <LoadingSkeleton />
        ) : resultsError ? (
          <ErrorState message="Failed to load team results" onRetry={() => resultsRefetch()} />
        ) : resultsData?.results && resultsData.results.length > 0 ? (
          <ResultsTable results={resultsData.results} />
        ) : (
          <p className="text-muted-foreground">No results available</p>
        )}
      </section>
    </div>
  );
}