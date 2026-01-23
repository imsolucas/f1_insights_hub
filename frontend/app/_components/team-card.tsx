import Link from 'next/link';
import { Constructor } from '../../lib/api-client';

interface TeamCardProps {
  constructor: Constructor;
}

export function TeamCard({ constructor }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${constructor.constructorId}`}
      className="block p-4 border border-border rounded-lg hover:border-primary transition-colors bg-card"
    >
      <h3 className="font-semibold text-foreground">{constructor.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{constructor.nationality}</p>
    </Link>
  );
}