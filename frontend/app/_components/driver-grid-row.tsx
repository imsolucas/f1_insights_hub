'use client';

import Image from 'next/image';
import { Driver } from '../../lib/api-client';
import { getTeamColorClass, getTeamLogoPath, getTeamInitials } from '../../lib/utils/team-colors';

interface DriverGridRowProps {
  driver: Driver;
  position: number;
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return `${num}ST`;
  if (j === 2 && k !== 12) return `${num}ND`;
  if (j === 3 && k !== 13) return `${num}RD`;
  return `${num}TH`;
}

export function DriverGridRow({ driver, position }: DriverGridRowProps) {
  const teamColorClass = getTeamColorClass(driver.currentTeam);
  const teamLogoPath = getTeamLogoPath(driver.currentTeam);
  const teamInitials = getTeamInitials(driver.currentTeam);
  const ordinalPosition = getOrdinalSuffix(position);

  return (
    <div
      className={`${teamColorClass} rounded-lg px-6 py-4 flex items-center justify-between hover:brightness-110 transition-all cursor-pointer group shadow-lg`}
    >
      {/* Position */}
      <div className="flex-shrink-0 w-16">
        <div className="bg-white/10 backdrop-blur-sm rounded px-3 py-1.5 inline-block">
          <span className="text-white font-bold text-sm tabular-nums">
            {ordinalPosition}
          </span>
        </div>
      </div>

      {/* Driver Name */}
      <div className="flex-1 px-4">
        <h3 className="text-white font-bold text-xl uppercase tracking-wide drop-shadow-lg">
          {driver.surname}
        </h3>
        {driver.driverChampionships > 0 && (
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: driver.driverChampionships }).map((_, i) => (
              <span key={i} className="text-yellow-300 text-xs">★</span>
            ))}
            <span className="text-white/80 text-xs ml-1">
              {driver.driverChampionships} {driver.driverChampionships === 1 ? 'Title' : 'Titles'}
            </span>
          </div>
        )}
      </div>

      {/* Team Logo */}
      <div className="flex-shrink-0 w-16 flex items-center justify-end">
        {teamLogoPath ? (
          <div className="relative w-10 h-10">
            <Image
              src={teamLogoPath}
              alt={`${driver.currentTeam} logo`}
              width={40}
              height={40}
              className="opacity-90 group-hover:opacity-100 transition-opacity object-contain"
            />
          </div>
        ) : (
          <div className="text-white font-bold text-xs bg-white/10 rounded px-2 py-1.5">
            {teamInitials}
          </div>
        )}
      </div>
    </div>
  );
}
