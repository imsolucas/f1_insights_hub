'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Driver } from '../../lib/api-client';
import { getTeamColorClass, getTeamLogoPath } from '../../lib/utils/team-colors';
import { getDriverImagePath } from '../../lib/utils/driver-images';

interface DriverExpandableGridProps {
  drivers: Driver[];
  isLoading?: boolean;
}

interface DriverGridItemProps {
  driver: Driver;
  position: number;
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function DriverGridItem({ driver, position, isExpanded, onMouseEnter, onMouseLeave }: DriverGridItemProps) {
  const teamName = driver.teamName || driver.currentTeam;
  const teamColorClass = getTeamColorClass(teamName);
  const teamLogoPath = getTeamLogoPath(teamName);
  const imagePath = getDriverImagePath(driver);
  const driverNumber = driver.driverNumber || driver.permanentNumber;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl cursor-pointer
        ${teamColorClass}
        transition-all duration-500 ease-out
        ${isExpanded 
          ? 'h-[280px] shadow-2xl z-20 scale-105' 
          : 'h-[120px] hover:shadow-lg hover:scale-[1.02]'
        }
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Background gradient */}
      <div className={`
        absolute inset-0 transition-opacity duration-500
        ${isExpanded 
          ? 'bg-gradient-to-r from-black/60 via-transparent to-black/40' 
          : 'bg-gradient-to-t from-black/70 via-black/20 to-transparent'
        }
      `} />

      {/* Collapsed State - Simple card */}
      <div className={`
        absolute inset-0 flex items-center transition-opacity duration-300
        ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}>
        {/* Position badge */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded px-2 py-0.5">
            <span className="text-white text-xs font-bold tabular-nums">
              P{position}
            </span>
          </div>
        </div>

        {/* Driver image (smaller, positioned right) */}
        <div className="absolute right-0 top-0 bottom-0 w-24 overflow-hidden">
          <Image
            src={imagePath}
            alt={`${driver.forename} ${driver.surname}`}
            fill
            sizes="96px"
            className="object-cover object-top"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Driver info (left side) */}
        <div className="relative z-10 pl-3 pr-28">
          <h3 
            className="text-white font-extrabold text-lg uppercase tracking-tight drop-shadow-lg italic leading-tight"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {driver.surname}
          </h3>
          {driverNumber && (
            <span 
              className="text-white/50 text-2xl font-extrabold italic"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {driverNumber}
            </span>
          )}
        </div>

        {/* Team logo */}
        {teamLogoPath && (
          <div className="absolute bottom-2 left-2 w-8 h-8 opacity-60">
            <Image
              src={teamLogoPath}
              alt={`${teamName} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Expanded State - Full details */}
      <div className={`
        absolute inset-0 flex transition-opacity duration-300
        ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Left side - Driver Image */}
        <div className="relative w-2/5 h-full">
          <Image
            src={imagePath}
            alt={`${driver.forename} ${driver.surname}`}
            fill
            sizes="(max-width: 1024px) 40vw, 20vw"
            className="object-cover object-top"
            priority={isExpanded}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/50" />
        </div>

        {/* Right side - Driver Info */}
        <div className="relative w-3/5 p-4 flex flex-col justify-between">
          {/* Top row - Position and Team Logo */}
          <div className="flex items-start justify-between">
            <div className="bg-black/40 backdrop-blur-sm rounded-md px-2 py-1">
              <span className="text-white/90 text-sm font-bold tabular-nums">
                P{position}
              </span>
            </div>
            
            {teamLogoPath && (
              <div className="relative w-12 h-12">
                <Image
                  src={teamLogoPath}
                  alt={`${teamName} logo`}
                  fill
                  className="object-contain opacity-90"
                />
              </div>
            )}
          </div>

          {/* Large Driver Number */}
          <div className="flex-1 flex items-center justify-end pr-2">
            {driverNumber && (
              <span 
                className="text-white/15 text-8xl font-extrabold italic leading-none"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {driverNumber}
              </span>
            )}
          </div>

          {/* Bottom - Driver Name and Team */}
          <div className="space-y-1">
            <p className="text-white/60 text-xs uppercase tracking-wide">
              {driver.nationality}
            </p>
            
            <h2 
              className="text-white font-extrabold text-xl uppercase tracking-tight drop-shadow-lg italic leading-tight"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {driver.forename} {driver.surname}
            </h2>
            
            <p 
              className="text-white/70 font-bold text-xs uppercase tracking-wide italic"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {teamName || 'Unknown Team'}
            </p>

            {driver.driverChampionships > 0 && (
              <div className="flex items-center gap-1 pt-1">
                {Array.from({ length: Math.min(driver.driverChampionships, 7) }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xs">★</span>
                ))}
                <span className="text-white/50 text-xs ml-1">
                  {driver.driverChampionships}x Champion
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="flex flex-col gap-3 max-w-4xl mx-auto">
      {Array.from({ length: 10 }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className={`flex gap-3 ${rowIndex % 2 === 0 ? 'justify-start' : 'justify-end'}`}
        >
          <div className="w-[45%] h-[120px] bg-slate-800 rounded-xl animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export function DriverExpandableGrid({ drivers, isLoading }: DriverExpandableGridProps) {
  const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

  if (isLoading) {
    return <GridSkeleton />;
  }

  if (!drivers || drivers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No drivers found</p>
      </div>
    );
  }

  // Create pairs of drivers for the starting grid layout
  // Each "row" represents a grid row with position on left or right
  const gridRows: Array<{ driver: Driver; position: number; side: 'left' | 'right' }> = [];
  
  drivers.forEach((driver, index) => {
    const position = index + 1;
    // Odd positions (1, 3, 5...) on left, even positions (2, 4, 6...) on right
    const side = position % 2 === 1 ? 'left' : 'right';
    gridRows.push({ driver, position, side });
  });

  return (
    <div className="flex flex-col gap-3 max-w-4xl mx-auto">
      {gridRows.map(({ driver, position, side }) => (
        <div 
          key={driver.id}
          className={`
            flex transition-all duration-500
            ${side === 'left' ? 'justify-start' : 'justify-end'}
            ${expandedDriverId === driver.id ? 'z-20' : 'z-10'}
          `}
        >
          <div className={`
            transition-all duration-500 ease-out
            ${expandedDriverId === driver.id 
              ? 'w-[85%] md:w-[75%]' 
              : 'w-[50%] md:w-[45%]'
            }
          `}>
            <DriverGridItem
              driver={driver}
              position={position}
              isExpanded={expandedDriverId === driver.id}
              onMouseEnter={() => setExpandedDriverId(driver.id)}
              onMouseLeave={() => setExpandedDriverId(null)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
