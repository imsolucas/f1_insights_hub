'use client';

import { useState } from 'react';
import { useDrivers } from '../../../lib/hooks/use-drivers';
import { useSyncDrivers } from '../../../lib/hooks/use-sync-drivers';
import { StartingGrid } from '../../_components/starting-grid';
import { ErrorState } from '../../_components/error-state';

export default function DriversPage() {
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const { data, isLoading, error, refetch } = useDrivers({ active: showActiveOnly ? true : undefined });
  const syncDrivers = useSyncDrivers();

  const handleSync = async () => {
    try {
      await syncDrivers.mutateAsync([2024, 2025]);
      // Refetch drivers after sync
      await refetch();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-foreground uppercase tracking-wide">F1 Drivers</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-muted-foreground">Active only</span>
          </label>
          <button
            onClick={handleSync}
            disabled={syncDrivers.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {syncDrivers.isPending ? 'Syncing...' : 'Sync from FastF1'}
          </button>
        </div>
      </div>

      {error ? (
        <ErrorState message="Failed to load drivers" onRetry={() => refetch()} />
      ) : (
        <StartingGrid drivers={data?.drivers || []} isLoading={isLoading} />
      )}
    </div>
  );
}