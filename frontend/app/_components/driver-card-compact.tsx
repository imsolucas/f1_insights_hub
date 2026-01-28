'use client';

import Image from 'next/image';
import { Driver } from '../../lib/api-client';
import { getTeamColorClass } from '../../lib/utils/team-colors';
import { getDriverImagePath } from '../../lib/utils/driver-images';

interface DriverCardCompactProps {
  driver: Driver;
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function DriverCardCompact({
  driver,
  isExpanded,
  onMouseEnter,
  onMouseLeave,
}: DriverCardCompactProps) {
  const teamName = driver.teamName || driver.currentTeam;
  const teamColorClass = getTeamColorClass(teamName);
  const imagePath = getDriverImagePath(driver);
  const driverNumber = driver.driverNumber || driver.permanentNumber;

  return (
    <div
      className={`
        relative aspect-square overflow-hidden rounded-lg cursor-pointer
        ${teamColorClass}
        transition-all duration-300 ease-out
        ${isExpanded ? 'scale-105 shadow-2xl z-10' : 'hover:scale-[1.02] hover:shadow-lg'}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Driver Image */}
      <div className="absolute inset-0">
        <Image
          src={imagePath}
          alt={`${driver.forename} ${driver.surname}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover object-top"
          onError={(e) => {
            // Hide image on error, show fallback
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Driver Number (top right) */}
      {driverNumber && (
        <div className="absolute top-2 right-2">
          <span 
            className="font-[var(--font-poppins)] text-white/40 text-4xl font-extrabold italic"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {driverNumber}
          </span>
        </div>
      )}

      {/* Driver Name (bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <h3 
          className="text-white font-extrabold text-lg uppercase tracking-wide drop-shadow-lg italic"
          style={{ fontFamily: 'var(--font-poppins)' }}
        >
          {driver.surname}
        </h3>
        
        {/* Championship stars */}
        {driver.driverChampionships > 0 && (
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: Math.min(driver.driverChampionships, 5) }).map((_, i) => (
              <span key={i} className="text-yellow-400 text-xs">★</span>
            ))}
            {driver.driverChampionships > 5 && (
              <span className="text-yellow-400/80 text-xs ml-0.5">+{driver.driverChampionships - 5}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
