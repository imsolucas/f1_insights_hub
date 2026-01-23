import Link from 'next/link';
import { Race } from '../../lib/api-client';
import { format } from 'date-fns';

interface RaceCardProps {
  race: Race;
}

export function RaceCard({ race }: RaceCardProps) {
  const raceDate = new Date(race.date);
  const isPast = raceDate < new Date();

  return (
    <Link
      href={`/schedule/${race.id}`}
      className="block p-4 border border-border rounded-lg hover:border-primary transition-colors bg-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{race.raceName}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {race.circuit.name}, {race.circuit.country}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {format(raceDate, 'MMM dd, yyyy')}
            {race.time && ` at ${race.time}`}
          </p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            isPast
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary/10 text-primary'
          }`}
        >
          {isPast ? 'Completed' : 'Upcoming'}
        </span>
      </div>
    </Link>
  );
}