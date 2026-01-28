'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDriversLineup } from '../../../lib/hooks/use-drivers-lineup';
import { DriverExpandableGrid } from '../../_components/driver-expandable-grid';
import { ErrorState } from '../../_components/error-state';

const SEASON_STORAGE_KEY = 'f1-insight-hub-drivers-selected-season';

export default function DriversPage() {
  const currentYear = new Date().getFullYear();
  
  // Initialize with currentYear to avoid hydration mismatch
  // Will be updated from localStorage after mount
  const [selectedSeason, setSelectedSeason] = useState<number>(currentYear);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Load season from localStorage after hydration
  useEffect(() => {
    setIsHydrated(true);
    const stored = localStorage.getItem(SEASON_STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed >= currentYear - 10 && parsed <= currentYear) {
        setSelectedSeason(parsed);
      }
    }
  }, [currentYear]);
  
  const { data, isLoading, error, refetch } = useDriversLineup({ 
    season: selectedSeason
  });

  // Save season to localStorage when it changes (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== 'undefined') {
      localStorage.setItem(SEASON_STORAGE_KEY, selectedSeason.toString());
    }
  }, [selectedSeason, isHydrated]);

  // Generate season options (current year and 10 years back)
  const seasonOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Image
            src="/f1-logo/f1-logo.svg"
            alt="F1"
            width={64}
            height={64}
            className="h-24 w-auto"
            priority
          />
          <h1 
            className="text-4xl font-extrabold text-foreground uppercase tracking-wide italic"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Drivers {selectedSeason}
          </h1>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Season Selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="season-select" className="text-sm font-medium text-muted-foreground">
              Season:
            </label>
            <select
              id="season-select"
              value={selectedSeason}
              onChange={(e) => {
                const newSeason = Number(e.target.value);
                setSelectedSeason(newSeason);
              }}
              className="px-4 py-2 text-sm font-medium border border-border rounded-xl bg-muted/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-primary/50"
            >
              {seasonOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <ErrorState message="Failed to load drivers" onRetry={() => refetch()} />
      ) : (
        <DriverExpandableGrid drivers={data?.drivers || []} isLoading={isLoading} />
      )}
    </div>
  );
}