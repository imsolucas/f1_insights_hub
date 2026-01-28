'use client';

import { useState, useEffect } from 'react';
import { useConstructorsLineup } from '../../../lib/hooks/use-constructors-lineup';
import { Constructor } from '../../../lib/api-client';
import { ErrorState } from '../../_components/error-state';
import Link from 'next/link';

const SEASON_STORAGE_KEY = 'f1-insight-hub-teams-selected-season';

interface TeamCardProps {
  constructor: Constructor;
}

function TeamCard({ constructor }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${constructor.constructorId}`}
      className="block bg-surface border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground mb-1">
            {constructor.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {constructor.nationality}
          </p>
        </div>
        <div className="shrink-0">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function TeamGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="bg-surface border border-border rounded-lg p-6 animate-pulse"
        >
          <div className="bg-slate-700 rounded h-6 w-32 mb-2"></div>
          <div className="bg-slate-700 rounded h-4 w-24"></div>
        </div>
      ))}
    </div>
  );
}

export default function TeamsPage() {
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
  const { data, isLoading, error, refetch } = useConstructorsLineup({
    season: selectedSeason,
  });

  // Save season to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SEASON_STORAGE_KEY, selectedSeason.toString());
    }
  }, [selectedSeason]);

  // Generate season options (current year and 10 years back)
  const seasonOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-foreground uppercase tracking-wide">
          F1 Teams
        </h1>
        <div className="flex items-center gap-4 flex-wrap">
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
        <ErrorState message="Failed to load teams" onRetry={() => refetch()} />
      ) : isLoading ? (
        <TeamGridSkeleton />
      ) : !data?.constructors || data.constructors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No teams found for this season
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.constructors.map((constructor) => (
            <TeamCard key={constructor.id} constructor={constructor} />
          ))}
        </div>
      )}
    </div>
  );
}
