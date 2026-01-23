'use client';

import { useCircuit, useCircuitRaces } from '../../../../lib/hooks/use-circuits';
import { RaceCard } from '../../../_components/race-card';
import { LoadingSkeleton } from '../../../_components/loading-skeleton';
import { ErrorState } from '../../../_components/error-state';

export default function CircuitDetailPage({ params }: { params: { circuitId: string } }) {
  const { data: circuitData, isLoading: circuitLoading, error: circuitError, refetch: circuitRefetch } = useCircuit(params.circuitId);
  const { data: racesData, isLoading: racesLoading, error: racesError, refetch: racesRefetch } = useCircuitRaces(params.circuitId);

  if (circuitLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSkeleton />
      </div>
    );
  }

  if (circuitError || !circuitData?.circuit) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorState message="Failed to load circuit details" onRetry={() => circuitRefetch()} />
      </div>
    );
  }

  const circuit = circuitData.circuit;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{circuit.name}</h1>
        <p className="text-lg text-muted-foreground">
          {circuit.location}, {circuit.country}
        </p>
        {circuit.lat && circuit.long && (
          <p className="text-muted-foreground">
            Coordinates: {circuit.lat}, {circuit.long}
          </p>
        )}
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Races at this Circuit</h2>
        {racesLoading ? (
          <LoadingSkeleton />
        ) : racesError ? (
          <ErrorState message="Failed to load races" onRetry={() => racesRefetch()} />
        ) : racesData?.races && racesData.races.length > 0 ? (
          <div className="space-y-4">
            {racesData.races.map((race) => (
              <RaceCard key={race.id} race={race} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No races found at this circuit</p>
        )}
      </section>
    </div>
  );
}