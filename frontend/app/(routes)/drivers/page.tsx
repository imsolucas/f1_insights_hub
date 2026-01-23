'use client';

import { useDrivers } from '../../../lib/hooks/use-drivers';
import { DriverCard } from '../../_components/driver-card';
import { LoadingSkeleton, CardSkeleton } from '../../_components/loading-skeleton';
import { ErrorState } from '../../_components/error-state';

export default function DriversPage() {
  const { data, isLoading, error, refetch } = useDrivers();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Drivers</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <ErrorState message="Failed to load drivers" onRetry={() => refetch()} />
      ) : data?.drivers && data.drivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.drivers.map((driver) => (
            <DriverCard key={driver.id} driver={driver} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No drivers found</p>
      )}
    </div>
  );
}