import Link from 'next/link';
import { Driver } from '../../lib/api-client';

interface DriverCardProps {
  driver: Driver;
}

export function DriverCard({ driver }: DriverCardProps) {
  return (
    <Link
      href={`/drivers/${driver.driverId}`}
      className="block p-4 border border-border rounded-lg hover:border-primary transition-colors bg-card"
    >
      <div className="flex items-center gap-4">
        {driver.permanentNumber && (
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-lg">
            {driver.permanentNumber}
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            {driver.forename} {driver.surname}
          </h3>
          {driver.code && (
            <p className="text-sm text-muted-foreground mt-1">Code: {driver.code}</p>
          )}
          <p className="text-sm text-muted-foreground mt-1">{driver.nationality}</p>
        </div>
      </div>
    </Link>
  );
}