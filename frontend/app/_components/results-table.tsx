import { RaceResult } from '../../lib/api-client';

interface ResultsTableProps {
  results: RaceResult[];
}

export function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) {
    return <p className="text-muted-foreground">No results available</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2 font-semibold text-foreground">Pos</th>
            <th className="text-left p-2 font-semibold text-foreground">Driver</th>
            <th className="text-left p-2 font-semibold text-foreground">Team</th>
            <th className="text-right p-2 font-semibold text-foreground">Points</th>
            <th className="text-right p-2 font-semibold text-foreground">Status</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.id} className="border-b border-border hover:bg-muted/50">
              <td className="p-2 text-foreground font-medium">
                {result.position ?? 'DNF'}
              </td>
              <td className="p-2 text-foreground">
                {result.driver.forename} {result.driver.surname}
              </td>
              <td className="p-2 text-muted-foreground">{result.constructor.name}</td>
              <td className="p-2 text-right text-foreground">{result.points}</td>
              <td className="p-2 text-right text-muted-foreground text-sm">{result.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}