import Link from 'next/link';
import { Circuit } from '../../lib/api-client';

interface CircuitCardProps {
  circuit: Circuit;
}

export function CircuitCard({ circuit }: CircuitCardProps) {
  return (
    <Link
      href={`/circuits/${circuit.circuitId}`}
      className="block p-4 border border-border rounded-lg hover:border-primary transition-colors bg-card"
    >
      <h3 className="font-semibold text-foreground">{circuit.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        {circuit.location}, {circuit.country}
      </p>
    </Link>
  );
}