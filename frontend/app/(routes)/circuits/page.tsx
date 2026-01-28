'use client';

import { useCircuits } from '../../../lib/hooks/use-circuits';
import { CircuitCard } from '../../_components/circuit-card';
import { CardSkeleton } from '../../_components/loading-skeleton';
import { ErrorState } from '../../_components/error-state';

export default function CircuitsPage() {
  const { data, isLoading, error, refetch } = useCircuits();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Circuits</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message="Failed to load circuits" onRetry={() => refetch()} />
      ) : data?.circuits && data.circuits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.circuits.map((circuit) => (
            <CircuitCard key={circuit.id} circuit={circuit} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No circuits found</p>
      )}
    </div>
  );
}