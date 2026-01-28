import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          console.error('API Error:', error.response.status, error.response.data);
        } else if (error.request) {
          console.error('API Request failed:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.client.get<ApiResponse<T> | ApiErrorResponse>(url, { params });
    if (!response.data.success) {
      const errorData = response.data as ApiErrorResponse;
      throw new Error(errorData.error?.message || 'API request failed');
    }
    const successData = response.data as ApiResponse<T>;
    return successData.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.post<ApiResponse<T> | ApiErrorResponse>(url, data);
    if (!response.data.success) {
      const errorData = response.data as ApiErrorResponse;
      throw new Error(errorData.error?.message || 'API request failed');
    }
    const successData = response.data as ApiResponse<T>;
    return successData.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.put<ApiResponse<T> | ApiErrorResponse>(url, data);
    if (!response.data.success) {
      const errorData = response.data as ApiErrorResponse;
      throw new Error(errorData.error?.message || 'API request failed');
    }
    const successData = response.data as ApiResponse<T>;
    return successData.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.client.patch<ApiResponse<T> | ApiErrorResponse>(url, data);
    if (!response.data.success) {
      const errorData = response.data as ApiErrorResponse;
      throw new Error(errorData.error?.message || 'API request failed');
    }
    const successData = response.data as ApiResponse<T>;
    return successData.data;
  }
}

export const apiClient = new ApiClient();

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  correlationId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  correlationId: string;
  timestamp: string;
}

// Races API
export interface Race {
  id: string;
  season: number;
  round: number;
  raceName: string;
  circuit: Circuit;
  date: string;
  time: string | null;
  sprintDate: string | null;
  sprintTime: string | null;
  qualifyingDate: string | null;
  qualifyingTime: string | null;
  url: string | null;
}

export interface RaceResult {
  id: string;
  position: number | null;
  points: number;
  grid: number | null;
  laps: number | null;
  status: string;
  time: string | null;
  driver: Driver;
  constructor: Constructor;
}

export interface QualifyingResult {
  id: string;
  position: number;
  q1: string | null;
  q2: string | null;
  q3: string | null;
  driver: Driver;
  constructor: Constructor;
}

export const racesApi = {
  getAll: (params?: { season?: number; limit?: number; offset?: number }) =>
    apiClient.get<{ races: Race[]; total: number; limit?: number; offset?: number }>('/races', params),
  
  getById: (raceId: string) =>
    apiClient.get<{ race: Race }>(`/races/${raceId}`),
  
  getResults: (raceId: string) =>
    apiClient.get<{ race: Race; results: RaceResult[] }>(`/races/${raceId}/results`),
  
  getQualifying: (raceId: string) =>
    apiClient.get<{ race: Race; results: QualifyingResult[] }>(`/races/${raceId}/qualifying`),
  
  getCurrentSchedule: () =>
    apiClient.get<{ races: Race[] }>('/races/current/schedule'),
};

// Drivers API
export interface Driver {
  id: string;
  driverId: string;
  code: string | null;
  forename: string;
  surname: string;
  dateOfBirth: string | null;
  nationality: string;
  url: string | null;
  permanentNumber: number | null;
  driverChampionships: number;
  constructorChampionships: number;
  currentTeam: string | null;
  isActive: boolean;
  teamName?: string; // From lineup
  driverNumber?: number | null; // From lineup
}

export interface DriverStats {
  driver: Driver;
  totalRaces: number;
  totalPoints: number;
  wins: number;
  podiums: number;
}

export interface SyncDriversResponse {
  message: string;
}

export interface SyncDriversRequest {
  seasons?: number[];
  season?: number;
  filter_confirmed?: boolean;
}

export const driversApi = {
  getAll: (params?: { season?: number; limit?: number; offset?: number; active?: boolean }) =>
    apiClient.get<{ drivers: Driver[]; total: number; limit?: number; offset?: number }>('/drivers', params),
  
  getLineup: (params: { season: number }) =>
    apiClient.get<{ drivers: Driver[]; total: number; season: number }>('/drivers/lineup', params),
  
  getById: (driverId: string) =>
    apiClient.get<{ driver: Driver }>(`/drivers/${driverId}`),
  
  getResults: (driverId: string) =>
    apiClient.get<{ driver: Driver; results: RaceResult[] }>(`/drivers/${driverId}/results`),
  
  getStats: (driverId: string) =>
    apiClient.get<DriverStats>(`/drivers/${driverId}/stats`),
  
  syncDrivers: (request?: SyncDriversRequest) =>
    apiClient.post<SyncDriversResponse>('/sync/drivers', request || {}),
};

// Constructors API
export interface Constructor {
  id: string;
  constructorId: string;
  name: string;
  nationality: string;
  url: string | null;
}

export interface ConstructorStats {
  constructor: Constructor;
  totalRaces: number;
  totalPoints: number;
  wins: number;
  podiums: number;
}

export interface SyncConstructorsResponse {
  message: string;
}

export interface SyncConstructorsRequest {
  seasons?: number[];
  season?: number;
}

export const constructorsApi = {
  getAll: (params?: { season?: number; limit?: number; offset?: number }) =>
    apiClient.get<{ constructors: Constructor[]; total: number; limit?: number; offset?: number }>('/constructors', params),
  
  getLineup: (params: { season: number }) =>
    apiClient.get<{ constructors: Constructor[]; total: number; season: number }>('/constructors/lineup', params),
  
  getById: (constructorId: string) =>
    apiClient.get<{ constructor: Constructor }>(`/constructors/${constructorId}`),
  
  getResults: (constructorId: string) =>
    apiClient.get<{ constructor: Constructor; results: RaceResult[] }>(`/constructors/${constructorId}/results`),
  
  getStats: (constructorId: string) =>
    apiClient.get<ConstructorStats>(`/constructors/${constructorId}/stats`),
  
  syncConstructors: (request?: SyncConstructorsRequest) =>
    apiClient.post<SyncConstructorsResponse>('/sync/constructors', request || {}),
};

// Lineups API
export interface SyncLineupsRequest {
  season: number;
}

export interface SyncLineupsResponse {
  message: string;
}

export const lineupsApi = {
  syncLineups: (request: SyncLineupsRequest) =>
    apiClient.post<SyncLineupsResponse>('/sync/lineups', request),
};

// Circuits API
export interface Circuit {
  id: string;
  circuitId: string;
  name: string;
  location: string;
  country: string;
  lat: number | null;
  long: number | null;
  alt: number | null;
  url: string | null;
}

export const circuitsApi = {
  getAll: () =>
    apiClient.get<{ circuits: Circuit[] }>('/circuits'),
  
  getById: (circuitId: string) =>
    apiClient.get<{ circuit: Circuit }>(`/circuits/${circuitId}`),
  
  getRaces: (circuitId: string) =>
    apiClient.get<{ circuit: Circuit; races: Race[] }>(`/circuits/${circuitId}/races`),
};

// Admin API
export interface UpdateDriverRequest {
  driverId: string;
  code?: string | null;
  forename?: string;
  surname?: string;
  dateOfBirth?: string | null;
  nationality?: string;
  url?: string | null;
  permanentNumber?: number | null;
  currentTeam?: string | null;
  isActive?: boolean;
  driverChampionships?: number;
  constructorChampionships?: number;
}

export interface CreateDriverRequest {
  driverId: string;
  code?: string | null;
  forename: string;
  surname: string;
  dateOfBirth?: string | null;
  nationality: string;
  url?: string | null;
  permanentNumber?: number | null;
  currentTeam?: string | null;
  isActive?: boolean;
  driverChampionships?: number;
  constructorChampionships?: number;
}

export interface UpdateConstructorRequest {
  constructorId: string;
  name?: string;
  nationality?: string;
  url?: string | null;
}

export interface CreateConstructorRequest {
  constructorId: string;
  name: string;
  nationality: string;
  url?: string | null;
}

export const adminApi = {
  updateDriver: (data: UpdateDriverRequest) =>
    apiClient.put<{ driver: Driver }>('/admin/drivers', data),
  
  createDriver: (data: CreateDriverRequest) =>
    apiClient.post<{ driver: Driver }>('/admin/drivers', data),
  
  updateDriverTeam: (driverId: string, teamName: string | null) =>
    apiClient.patch<{ driver: Driver }>(`/admin/drivers/${driverId}/team`, { teamName }),
  
  updateConstructor: (data: UpdateConstructorRequest) =>
    apiClient.put<{ constructor: Constructor }>('/admin/constructors', data),
  
  createConstructor: (data: CreateConstructorRequest) =>
    apiClient.post<{ constructor: Constructor }>('/admin/constructors', data),
};