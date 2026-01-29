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
  
  if (normalized.includes('ferrari')) return '/team-logos/2026ferrarilogowhite.webp';
  if (normalized.includes('mercedes')) return '/team-logos/2026mercedeslogowhite.webp';
  // Check Racing Bulls before Red Bull Racing to avoid conflicts
  if (normalized.includes('racing bulls') || (normalized.includes('rb ') && !normalized.includes('red bull')) || normalized === 'rb') {
    return '/team-logos/2026racingbullslogowhite.webp';
  }
  if (normalized.includes('red bull') || normalized.includes('redbull')) {
    return '/team-logos/2026redbullracinglogowhite.webp';
  }
  if (normalized.includes('mclaren')) return '/team-logos/2026mclarenlogowhite.webp';
  if (normalized.includes('aston martin') || normalized.includes('astonmartin')) return '/team-logos/2026astonmartinlogowhite.webp';
  if (normalized.includes('alpine')) return '/team-logos/2026alpinelogowhite.webp';
  if (normalized.includes('williams')) return '/team-logos/2026williamslogowhite.webp';
  if (normalized.includes('haas')) return '/team-logos/2026haasf1teamlogowhite.webp';
  if (normalized.includes('sauber') || normalized.includes('kick sauber') || normalized.includes('audi')) return '/team-logos/2026audilogowhite.webp';
  if (normalized.includes('cadillac')) return '/team-logos/2026cadillaclogowhite.webp';
  if (normalized.includes('cadillac')) return '/team-logos/2026cadillaclogowhite.webp';
  
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

/**
 * Get team car image path.
 */
export function getTeamCarPath(teamName: string | null | undefined): string {
  if (!teamName) return '/team-cars/2026ferraricarright.webp'; // Default fallback
  
  const normalized = teamName.toLowerCase().trim();
  
  if (normalized.includes('ferrari')) return '/team-cars/2026ferraricarright.webp';
  if (normalized.includes('mercedes')) return '/team-cars/2026mercedescarright.webp';
  // Check Racing Bulls before Red Bull Racing to avoid conflicts
  if (normalized.includes('racing bulls') || (normalized.includes('rb ') && !normalized.includes('red bull')) || normalized === 'rb') {
    return '/team-cars/2026racingbullscarright.webp';
  }
  if (normalized.includes('red bull') || normalized.includes('redbull')) {
    return '/team-cars/2026redbullracingcarright.webp';
  }
  if (normalized.includes('mclaren')) return '/team-cars/2026mclarencarright.webp';
  if (normalized.includes('aston martin') || normalized.includes('astonmartin')) return '/team-cars/2026astonmartincarright.webp';
  if (normalized.includes('alpine')) return '/team-cars/2026alpinecarright.webp';
  if (normalized.includes('williams')) return '/team-cars/2026williamscarright.webp';
  if (normalized.includes('haas')) return '/team-cars/2026haasf1teamcarright.webp';
  if (normalized.includes('sauber') || normalized.includes('kick sauber') || normalized.includes('audi')) return '/team-cars/2026audicarright.webp';
  if (normalized.includes('cadillac')) return '/team-cars/2026cadillaccarright.webp';
  
  return '/team-cars/2026ferraricarright.webp'; // Default fallback
}
