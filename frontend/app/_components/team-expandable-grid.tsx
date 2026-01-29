'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ConstructorWithDrivers } from '../../lib/api-client';
import { getTeamColorClass, getTeamLogoPath } from '../../lib/utils/team-colors';
import { getTeamCarPath } from '../../lib/utils/team-colors';
import { getDriverImagePath, getDriverInitials } from '../../lib/utils/driver-images';
import type { Driver } from '../../lib/api-client';

interface TeamExpandableGridProps {
  constructors: ConstructorWithDrivers[];
  isLoading?: boolean;
}

interface TeamGridItemProps {
  constructor: ConstructorWithDrivers;
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function DriverIcon({ driver, size = 'sm' }: { driver: Driver; size?: 'sm' | 'md' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-[10px]' : 'w-20 h-20 text-lg';
  if (imgError) {
    return (
      <div
        className={`relative rounded-full shrink-0 border-2 border-white/30 bg-white/20 flex items-center justify-center ${sizeClass}`}
        title={`${driver.forename} ${driver.surname}`}
      >
        <span className="text-white font-bold tabular-nums">
          {getDriverInitials(driver)}
        </span>
      </div>
    );
  }
  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 border-2 border-white/30 bg-black/20 ${size === 'sm' ? 'w-8 h-8' : 'w-20 h-20'}`}>
      <Image
        src={getDriverImagePath(driver)}
        alt={`${driver.forename} ${driver.surname}`}
        fill
        sizes={size === 'sm' ? '32px' : '80px'}
        className="object-cover object-top"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

function ExpandedDriverPhoto({ driver, priority }: { driver: Driver; priority: boolean }) {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <span className="text-white/80 text-2xl font-bold tabular-nums">
          {getDriverInitials(driver)}
        </span>
      </div>
    );
  }
  return (
    <>
      <Image
        src={getDriverImagePath(driver)}
        alt={`${driver.forename} ${driver.surname}`}
        fill
        sizes="(max-width: 768px) 25vw, 320px"
        className="object-cover object-top"
        priority={priority}
        quality={90}
        onError={() => setImgError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/50 pointer-events-none" />
    </>
  );
}

function TeamGridItem({ constructor, isExpanded, onMouseEnter, onMouseLeave }: TeamGridItemProps) {
  const teamColorClass = getTeamColorClass(constructor.name);
  const teamLogoPath = getTeamLogoPath(constructor.name);
  const teamCarPath = getTeamCarPath(constructor.name);
  const driverCount = constructor.drivers?.length || 0;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl cursor-pointer
        ${teamColorClass}
        transition-all duration-500 ease-out
        ${isExpanded 
          ? 'h-[320px] shadow-2xl z-20 scale-[1.02]' 
          : 'h-[140px] hover:shadow-lg hover:scale-[1.01]'
        }
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Background gradient */}
      <div className={`
        absolute inset-0 transition-opacity duration-500
        ${isExpanded 
          ? 'bg-gradient-to-r from-black/70 via-black/40 to-black/60' 
          : 'bg-gradient-to-r from-black/60 via-transparent to-black/30'
        }
      `} />

      {/* Collapsed State */}
      <div className={`
        absolute inset-0 flex items-center transition-opacity duration-300
        ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}
      `}>
        {/* Team logo (top-right, overlay badge) */}
        {teamLogoPath && (
          <div className="absolute top-3 right-3 w-10 h-10 z-10 rounded-full bg-black/30 flex items-center justify-center overflow-hidden">
            <Image
              src={teamLogoPath}
              alt={`${constructor.name} logo`}
              fill
              className="object-contain opacity-90 p-1"
            />
          </div>
        )}

        {/* Team car image (right side) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[55%] h-[90%] overflow-hidden">
          <Image
            src={teamCarPath}
            alt={`${constructor.name} car`}
            fill
            sizes="(max-width: 768px) 55vw, 30vw"
            className="object-contain object-right"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Team info + driver icons (left side) */}
        <div className="relative z-10 pl-4 pr-[48%] pt-3 flex flex-col gap-2">
          <h3 
            className="text-white font-extrabold text-xl uppercase tracking-tight drop-shadow-lg italic leading-tight"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {constructor.name}
          </h3>
          <p className="text-white/60 text-xs -mt-0.5">
            {constructor.nationality}
          </p>
          {/* Driver icons + names (like reference image) */}
          <div className="flex flex-col gap-1.5 mt-1">
            {constructor.drivers?.slice(0, 2).map((driver) => (
              <div key={driver.id} className="flex items-center gap-2">
                <DriverIcon driver={driver} size="sm" />
                <p 
                  className="text-white font-bold text-xs uppercase tracking-tight truncate"
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  <span className="text-white/90">{driver.forename}</span>{' '}
                  <span className="text-white font-extrabold">{driver.surname}</span>
                </p>
              </div>
            ))}
            {driverCount === 0 && (
              <p className="text-white/50 text-xs">No drivers announced</p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded State */}
      <div className={`
        absolute inset-0 flex flex-col transition-opacity duration-300
        ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        {/* Team car as subtle background */}
        <div className="absolute inset-0 opacity-20">
          <Image
            src={teamCarPath}
            alt={`${constructor.name} car`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center"
            priority={isExpanded}
          />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 flex flex-col h-full p-4">
          {/* Top row - Team name and logo */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 
                className="text-white font-extrabold text-xl uppercase tracking-tight drop-shadow-lg italic leading-tight"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {constructor.name}
              </h2>
              <p className="text-white/60 text-xs mt-0.5">
                {constructor.nationality}
              </p>
            </div>
            
            {teamLogoPath && (
              <div className="relative w-12 h-12 shrink-0">
                <Image
                  src={teamLogoPath}
                  alt={`${constructor.name} logo`}
                  fill
                  className="object-contain opacity-90"
                />
              </div>
            )}
          </div>

          {/* Drivers section - styled like driver page cards */}
          <div className="flex-1 flex items-stretch justify-center gap-3 min-h-0">
            {constructor.drivers?.slice(0, 2).map((driver) => {
              const driverNumber = driver.driverNumber || driver.permanentNumber;
              return (
                <div 
                  key={driver.id} 
                  className="flex-1 relative overflow-hidden rounded-lg bg-black/30 border border-white/10 min-w-0"
                >
                  {/* Driver mini-card: image left (no overlay on photo), info right */}
                  <div className="absolute inset-0 flex min-w-0">
                    {/* Left side - Driver Image only; fallback to initials if load fails */}
                    <div className="relative w-2/5 h-full shrink-0 overflow-hidden">
                      <ExpandedDriverPhoto driver={driver} priority={isExpanded} />
                    </div>

                    {/* Right side - Driver Info only; number as small badge, no watermark */}
                    <div className="relative w-3/5 p-2 flex flex-col justify-end shrink-0 overflow-hidden">
                      <div className="space-y-0.5">
                        <p className="text-white/50 text-[10px] uppercase tracking-wide">
                          {driver.nationality}
                        </p>
                        <p 
                          className="text-white font-extrabold text-sm uppercase tracking-tight drop-shadow-lg italic leading-tight"
                          style={{ fontFamily: 'var(--font-poppins)' }}
                        >
                          {driver.forename}
                        </p>
                        <p 
                          className="text-white font-extrabold text-base uppercase tracking-tight drop-shadow-lg italic leading-tight flex items-center gap-1.5"
                          style={{ fontFamily: 'var(--font-poppins)' }}
                        >
                          {driver.surname}
                          {driverNumber != null && (
                            <span className="text-white/40 text-sm font-medium tabular-nums">
                              #{driverNumber}
                            </span>
                          )}
                        </p>
                        
                        {driver.driverChampionships > 0 && (
                          <div className="flex items-center gap-0.5 pt-0.5">
                            {Array.from({ length: Math.min(driver.driverChampionships, 5) }).map((_, i) => (
                              <span key={i} className="text-yellow-400 text-[10px]">★</span>
                            ))}
                            <span className="text-white/40 text-[10px] ml-0.5">
                              {driver.driverChampionships}x WDC
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {driverCount === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-white/50 text-sm">No drivers announced</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="h-[140px] bg-slate-700/30 rounded-xl animate-pulse border border-white/5"
        >
          <div className="p-4 space-y-3">
            <div className="w-10 h-10 bg-slate-600/50 rounded" />
            <div className="w-32 h-6 bg-slate-600/50 rounded" />
            <div className="w-24 h-4 bg-slate-600/30 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeamExpandableGrid({ constructors, isLoading }: TeamExpandableGridProps) {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  if (isLoading) {
    return <TeamGridSkeleton />;
  }

  if (!constructors || constructors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No teams found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {constructors.map((constructor) => (
        <TeamGridItem
          key={constructor.id}
          constructor={constructor}
          isExpanded={expandedTeamId === constructor.id}
          onMouseEnter={() => setExpandedTeamId(constructor.id)}
          onMouseLeave={() => setExpandedTeamId(null)}
        />
      ))}
    </div>
  );
}
