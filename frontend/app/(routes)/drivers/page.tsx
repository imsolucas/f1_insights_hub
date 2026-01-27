'use client';

import { useState, useEffect } from 'react';
import { useDrivers } from '../../../lib/hooks/use-drivers';
import { StartingGrid } from '../../_components/starting-grid';
import { ErrorState } from '../../_components/error-state';

const SEASON_STORAGE_KEY = 'f1-insight-hub-selected-season';

export default function DriversPage() {
  const currentYear = new Date().getFullYear();
  
  // Load season from localStorage or default to current year
  const [selectedSeason, setSelectedSeason] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SEASON_STORAGE_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed) && parsed >= currentYear - 10 && parsed <= currentYear) {
          return parsed;
        }
      }
    }
    return currentYear;
  });
  
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const { data, isLoading, error, refetch } = useDrivers({ 
    season: selectedSeason,
    active: showActiveOnly ? true : undefined 
  });

  // Generate season options (current year and 10 years back)
  const seasonOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-foreground uppercase tracking-wide">F1 Drivers</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="w-4 h-4 rounded border-border accent-primary"
            />
            <span className="text-sm text-muted-foreground">Active only</span>
          </label>
          
          {/* Season Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="season-select" className="text-sm text-muted-foreground">
              Season:
            </label>
            <select
              id="season-select"
              value={selectedSeason}
              onChange={(e) => {
                const newSeason = Number(e.target.value);
                setSelectedSeason(newSeason);
                // Save to localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem(SEASON_STORAGE_KEY, newSeason.toString());
                }
                // Automatically refetch when season changes
                refetch();
              }}
              className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
        <StartingGrid drivers={data?.drivers || []} isLoading={isLoading} />
      )}
    </div>
  );
}