'use client';

import Image from 'next/image';
import { Driver } from '../../lib/api-client';
import { getTeamColorClass, getTeamLogoPath } from '../../lib/utils/team-colors';
import { getDriverImagePath } from '../../lib/utils/driver-images';

interface DriverCardExpandedProps {
  driver: Driver;
  position: number;
  onMouseLeave: () => void;
}

export function DriverCardExpanded({
  driver,
  position,
  onMouseLeave,
}: DriverCardExpandedProps) {
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
        shadow-2xl
        transition-all duration-300 ease-out
        min-h-[280px]
      `}
      onMouseLeave={onMouseLeave}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40" />
      
      <div className="relative flex h-full min-h-[280px]">
        {/* Left side - Driver Image */}
        <div className="relative w-1/2 min-h-[280px]">
          <Image
            src={imagePath}
            alt={`${driver.forename} ${driver.surname}`}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover object-top"
            priority
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Gradient overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60" />
        </div>

        {/* Right side - Driver Info */}
        <div className="relative w-1/2 p-4 flex flex-col justify-between">
          {/* Position badge (top left of info section) */}
          <div className="flex items-start justify-between">
            <div className="bg-black/40 backdrop-blur-sm rounded-md px-2 py-1">
              <span className="text-white/90 text-xs font-semibold tabular-nums">
                {position}
                <sup className="text-[8px] ml-0.5">
                  {position === 1 ? 'ST' : position === 2 ? 'ND' : position === 3 ? 'RD' : 'TH'}
                </sup>
              </span>
            </div>
            
            {/* Team Logo */}
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

          {/* Driver Number - Large */}
          <div className="flex-1 flex items-center justify-end pr-2">
            {driverNumber && (
              <span 
                className="text-white/20 text-7xl font-extrabold italic leading-none"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {driverNumber}
              </span>
            )}
          </div>

          {/* Driver Name and Team */}
          <div className="space-y-1">
            {/* Nationality flag placeholder */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/60 text-xs uppercase tracking-wide">
                {driver.nationality}
              </span>
            </div>
            
            {/* Driver Name */}
            <h2 
              className="text-white font-extrabold text-2xl uppercase tracking-tight drop-shadow-lg italic leading-tight"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {driver.forename} {driver.surname}
            </h2>
            
            {/* Team Name */}
            <p 
              className="text-white/80 font-bold text-sm uppercase tracking-wide italic"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              {teamName || 'Unknown Team'}
            </p>

            {/* Championship stars */}
            {driver.driverChampionships > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: Math.min(driver.driverChampionships, 7) }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
                {driver.driverChampionships > 7 && (
                  <span className="text-yellow-400/80 text-xs ml-1">+{driver.driverChampionships - 7}</span>
                )}
                <span className="text-white/60 text-xs ml-2">
                  {driver.driverChampionships} {driver.driverChampionships === 1 ? 'Title' : 'Titles'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
