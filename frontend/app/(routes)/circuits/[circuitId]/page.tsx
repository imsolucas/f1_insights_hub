'use client';

import { use } from 'react';
import Image from 'next/image';
import { useCircuit, useCircuitRaces } from '../../../../lib/hooks/use-circuits';
import { RaceCard } from '../../../_components/race-card';
import { LoadingSkeleton } from '../../../_components/loading-skeleton';
import { ErrorState } from '../../../_components/error-state';

export default function CircuitDetailPage({ params }: { params: Promise<{ circuitId: string }> }) {
  const { circuitId } = use(params);
  const { data: circuitData, isLoading: circuitLoading, error: circuitError, refetch: circuitRefetch } = useCircuit(circuitId);
  const { data: racesData, isLoading: racesLoading, error: racesError, refetch: racesRefetch } = useCircuitRaces(circuitId);

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
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/f1-logo/f1-logo.svg"
            alt="F1"
            width={64}
            height={64}
            className="h-16 w-auto"
          />
          <h1 
            className="text-3xl font-extrabold text-foreground uppercase tracking-wide italic"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {circuit.name}
          </h1>
        </div>
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
        <h2 
          className="text-2xl font-bold text-foreground mb-4 uppercase tracking-wide italic"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          Races at this Circuit
        </h2>
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