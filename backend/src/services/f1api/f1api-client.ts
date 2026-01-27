import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';
import { F1ApiResponse, F1ApiDriver, F1ApiTeam, F1ApiTeamWithDrivers } from './types';

class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private readonly minDelay: number;

  constructor(requestsPerSecond: number) {
    this.minDelay = 1000 / requestsPerSecond;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const startTime = Date.now();

    const fn = this.queue.shift();
    if (fn) {
      await fn();
      const elapsed = Date.now() - startTime;
      const delay = Math.max(0, this.minDelay - elapsed);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.processing = false;
    this.process();
  }
}

export class F1ApiClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = axios.create({
      baseURL: config.F1_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });

    // Rate limit: 10 requests per second (conservative limit for f1api.dev)
    this.rateLimiter = new RateLimiter(10);

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          logger.error('F1 API error', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url,
          });
        } else if (error.request) {
          logger.error('F1 API request failed', {
            url: error.config?.url,
            message: error.message,
          });
        }
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(endpoint: string, params?: Record<string, string | number>): Promise<T> {
    return this.rateLimiter.execute(async () => {
      try {
        const response = await this.client.get<F1ApiResponse<T>>(endpoint, { params });
        return response.data as unknown as T;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('F1 API request failed', { endpoint, params, error: errorMessage });
        throw error;
      }
    });
  }

  async getCurrentDrivers(): Promise<F1ApiDriver[]> {
    const response = await this.request<F1ApiDriver[]>('api/current/drivers');
    return (response as unknown as F1ApiResponse<F1ApiDriver>).drivers || [];
  }

  async getDriversByYear(year: number): Promise<F1ApiDriver[]> {
    const response = await this.request<F1ApiDriver[]>(`api/${year}/drivers`);
    return (response as unknown as F1ApiResponse<F1ApiDriver>).drivers || [];
  }

  async getCurrentTeams(): Promise<F1ApiTeam[]> {
    const response = await this.request<F1ApiTeam[]>('api/current/teams');
    return (response as unknown as F1ApiResponse<F1ApiTeam>).teams || [];
  }

  async getTeamsByYear(year: number): Promise<F1ApiTeam[]> {
    const response = await this.request<F1ApiTeam[]>(`api/${year}/teams`);
    return (response as unknown as F1ApiResponse<F1ApiTeam>).teams || [];
  }

  async getTeamDrivers(teamId: string, year?: number): Promise<F1ApiTeamWithDrivers> {
    const endpoint = year
      ? `api/${year}/teams/${teamId}/drivers`
      : `api/current/teams/${teamId}/drivers`;
    const response = await this.request<F1ApiTeamWithDrivers>(endpoint);
    return response as unknown as F1ApiTeamWithDrivers;
  }

  async getDriver(driverId: string, year?: number): Promise<F1ApiDriver> {
    const endpoint = year
      ? `api/${year}/drivers/${driverId}`
      : `api/current/drivers/${driverId}`;
    const response = await this.request<F1ApiDriver>(endpoint);
    return response as unknown as F1ApiDriver;
  }

  async getTeam(teamId: string, year?: number): Promise<F1ApiTeam> {
    const endpoint = year
      ? `api/${year}/teams/${teamId}`
      : `api/current/teams/${teamId}`;
    const response = await this.request<F1ApiTeam>(endpoint);
    return response as unknown as F1ApiTeam;
  }
}
