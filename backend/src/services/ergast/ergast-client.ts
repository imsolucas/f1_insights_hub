import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config/env';
import { logger } from '../../utils/logger';
import {
  ErgastResponse,
  RaceTable,
  DriverTable,
  ConstructorTable,
  CircuitTable,
} from './types';

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

export class ErgastClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;

  constructor() {
    this.client = axios.create({
      baseURL: config.ERGAST_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
      },
    });

    // Rate limit: 4 requests per second (Ergast API limit)
    this.rateLimiter = new RateLimiter(4);

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          logger.error('Ergast API error', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: error.config?.url,
          });
        } else if (error.request) {
          logger.error('Ergast API request failed', {
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
        const response = await this.client.get<ErgastResponse<T>>(endpoint, { params });
        return response.data.MRData as T;
      } catch (error: unknown) {
        // Handle specific error cases
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 441) {
            logger.warn('Ergast API returned 441 - API may be temporarily unavailable', { endpoint });
            throw new Error(`Ergast API unavailable (441). The API may be down or rate-limited. Please try again later.`);
          }
        }
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Ergast API request failed', { endpoint, params, error: errorMessage });
        throw error;
      }
    });
  }

  async getRaces(season?: number, round?: number): Promise<RaceTable> {
    let endpoint = season ? `${season}` : 'current';
    if (round) {
      endpoint += `/${round}`;
    }
    endpoint += '.json';
    return this.request<RaceTable>(endpoint, { limit: '1000' });
  }

  async getDrivers(season?: number): Promise<DriverTable> {
    let endpoint = season ? `${season}` : 'current';
    endpoint += '/drivers.json';
    return this.request<DriverTable>(endpoint, { limit: '1000' });
  }

  async getConstructors(season?: number): Promise<ConstructorTable> {
    let endpoint = season ? `${season}` : 'current';
    endpoint += '/constructors.json';
    return this.request<ConstructorTable>(endpoint, { limit: '1000' });
  }

  async getCircuits(): Promise<CircuitTable> {
    return this.request<CircuitTable>('circuits.json', { limit: '1000' });
  }

  async getRaceResults(season: number, round: number): Promise<RaceTable> {
    return this.request<RaceTable>(`${season}/${round}/results.json`, { limit: '100' });
  }

  async getQualifyingResults(season: number, round: number): Promise<RaceTable> {
    return this.request<RaceTable>(`${season}/${round}/qualifying.json`, { limit: '100' });
  }

  async getCurrentSeasonSchedule(): Promise<RaceTable> {
    return this.getRaces();
  }
}