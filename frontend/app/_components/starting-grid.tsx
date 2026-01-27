'use client';

import { Driver } from '../../lib/api-client';
import { DriverGridRow } from './driver-grid-row';
import { LoadingSkeleton } from './loading-skeleton';

interface StartingGridProps {
  drivers: Driver[];
  isLoading?: boolean;
}

function GridRowSkeleton() {
  return (
    <div className="bg-slate-800 rounded-lg px-6 py-4 flex items-center justify-between animate-pulse">
      <div className="flex-shrink-0 w-16">
        <div className="bg-slate-700 rounded px-3 py-1.5 w-12 h-6"></div>
      </div>
      <div className="flex-1 px-4">
        <div className="bg-slate-700 rounded h-6 w-32"></div>
      </div>
      <div className="flex-shrink-0 w-16">
        <div className="bg-slate-700 rounded w-10 h-10"></div>
      </div>
    </div>
  );
}

export function StartingGrid({ drivers, isLoading }: StartingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <GridRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No drivers found</p>
      </div>
    );
  }

  // Drivers are already sorted by the backend:
  // - By season standings position if available
  // - Otherwise by team + surname
  // No need to re-sort here

  // Split into two columns: odd positions (left), even positions (right)
  const leftColumnDrivers: Array<{ driver: Driver; position: number }> = [];
  const rightColumnDrivers: Array<{ driver: Driver; position: number }> = [];

  drivers.forEach((driver, index) => {
    const position = index + 1;
    if (position % 2 === 1) {
      // Odd positions go to left column
      leftColumnDrivers.push({ driver, position });
    } else {
      // Even positions go to right column
      rightColumnDrivers.push({ driver, position });
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Column (Odd Positions) */}
      <div className="space-y-3">
        {leftColumnDrivers.map(({ driver, position }) => (
          <DriverGridRow key={driver.id} driver={driver} position={position} />
        ))}
      </div>

      {/* Right Column (Even Positions) */}
      <div className="space-y-3 lg:pt-12">
        {rightColumnDrivers.map(({ driver, position }) => (
          <DriverGridRow key={driver.id} driver={driver} position={position} />
        ))}
      </div>
    </div>
  );
}
