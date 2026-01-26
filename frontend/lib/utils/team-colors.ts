/**
 * Map team names to CSS class names for team colors.
 * Handles various team name formats from the API.
 */
export function getTeamColorClass(teamName: string | null | undefined): string {
  if (!teamName) return 'bg-slate-700';
  
  const normalized = teamName.toLowerCase().trim();
  
  // Map team names to CSS classes
  if (normalized.includes('ferrari')) return 'team-ferrari';
  if (normalized.includes('mercedes')) return 'team-mercedes';
  if (normalized.includes('red bull') || normalized.includes('redbull')) return 'team-redbull';
  if (normalized.includes('mclaren')) return 'team-mclaren';
  if (normalized.includes('aston martin') || normalized.includes('astonmartin')) return 'team-astonmartin';
  if (normalized.includes('alpine')) return 'team-alpine';
  if (normalized.includes('williams')) return 'team-williams';
  if (normalized.includes('haas')) return 'team-haas';
  if (normalized.includes('sauber') || normalized.includes('kick sauber')) return 'team-sauber';
  if (normalized.includes('rb ') || normalized === 'rb' || normalized.includes('racing bulls')) return 'team-rb';
  
  // Default fallback
  return 'bg-slate-700';
}

/**
 * Get team logo path.
 */
export function getTeamLogoPath(teamName: string | null | undefined): string | null {
  if (!teamName) return null;
  
  const normalized = teamName.toLowerCase().trim();
  
  if (normalized.includes('ferrari')) return '/team-logos/ferrari.svg';
  if (normalized.includes('mercedes')) return '/team-logos/mercedes.svg';
  if (normalized.includes('red bull') || normalized.includes('redbull')) return '/team-logos/redbull.svg';
  if (normalized.includes('mclaren')) return '/team-logos/mclaren.svg';
  if (normalized.includes('aston martin') || normalized.includes('astonmartin')) return '/team-logos/astonmartin.svg';
  if (normalized.includes('alpine')) return '/team-logos/alpine.svg';
  if (normalized.includes('williams')) return '/team-logos/williams.svg';
  if (normalized.includes('haas')) return '/team-logos/haas.svg';
  if (normalized.includes('sauber') || normalized.includes('kick sauber')) return '/team-logos/sauber.svg';
  if (normalized.includes('rb ') || normalized === 'rb' || normalized.includes('racing bulls')) return '/team-logos/rb.svg';
  
  return null;
}

/**
 * Get team initials for fallback display.
 */
export function getTeamInitials(teamName: string | null | undefined): string {
  if (!teamName) return 'F1';
  
  const normalized = teamName.toLowerCase().trim();
  
  if (normalized.includes('ferrari')) return 'FER';
  if (normalized.includes('mercedes')) return 'MER';
  if (normalized.includes('red bull') || normalized.includes('redbull')) return 'RBR';
  if (normalized.includes('mclaren')) return 'MCL';
  if (normalized.includes('aston martin') || normalized.includes('astonmartin')) return 'AM';
  if (normalized.includes('alpine')) return 'ALP';
  if (normalized.includes('williams')) return 'WIL';
  if (normalized.includes('haas')) return 'HAA';
  if (normalized.includes('sauber') || normalized.includes('kick sauber')) return 'SAU';
  if (normalized.includes('rb ') || normalized === 'rb' || normalized.includes('racing bulls')) return 'RB';
  
  return 'F1';
}
