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

export const driversApi = {
  getAll: (params?: { season?: number; limit?: number; offset?: number; active?: boolean }) =>
    apiClient.get<{ drivers: Driver[]; total: number; limit?: number; offset?: number }>('/drivers', params),
  
  getById: (driverId: string) =>
    apiClient.get<{ driver: Driver }>(`/drivers/${driverId}`),
  
  getResults: (driverId: string) =>
    apiClient.get<{ driver: Driver; results: RaceResult[] }>(`/drivers/${driverId}/results`),
  
  getStats: (driverId: string) =>
    apiClient.get<DriverStats>(`/drivers/${driverId}/stats`),
  
  syncDrivers: (seasons?: number[]) =>
    apiClient.post<SyncDriversResponse>('/sync/drivers', { seasons }),
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

export const constructorsApi = {
  getAll: (params?: { season?: number; limit?: number; offset?: number }) =>
    apiClient.get<{ constructors: Constructor[]; total: number; limit?: number; offset?: number }>('/constructors', params),
  
  getById: (constructorId: string) =>
    apiClient.get<{ constructor: Constructor }>(`/constructors/${constructorId}`),
  
  getResults: (constructorId: string) =>
    apiClient.get<{ constructor: Constructor; results: RaceResult[] }>(`/constructors/${constructorId}/results`),
  
  getStats: (constructorId: string) =>
    apiClient.get<ConstructorStats>(`/constructors/${constructorId}/stats`),
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