// F1 API (f1api.dev) response types

export interface F1ApiResponse<T> {
  api: string;
  url: string;
  limit: number;
  offset: number;
  total: number;
  season?: number;
  championshipId?: string;
  drivers?: T[];
  teams?: T[];
}

export interface F1ApiDriver {
  driverId: string;
  name: string;
  surname: string;
  nationality: string;
  birthday: string;
  number: number;
  shortName: string;
  url: string;
  teamId: string;
}

export interface F1ApiTeam {
  teamId: string;
  teamName: string;
  teamNationality: string;
  firstAppeareance: number;
  constructorsChampionships: number | null;
  driversChampionships: number | null;
  url: string;
}

export interface F1ApiTeamWithDrivers extends F1ApiTeam {
  drivers: F1ApiDriver[];
}
