import { ErgastClient } from './ergast-client';
import { prisma } from '../../lib/prisma';
import { logger } from '../../utils/logger';
import {
  Race,
  Driver,
  Constructor,
  Circuit,
  RaceResult,
  QualifyingResult,
} from './types';

export class ErgastService {
  private client: ErgastClient;

  constructor() {
    this.client = new ErgastClient();
  }

  async fetchAndSyncRaces(season: number): Promise<void> {
    try {
      logger.info(`Fetching races for season ${season}`);
      const raceTable = await this.client.getRaces(season);

      if (!raceTable.Races || raceTable.Races.length === 0) {
        logger.warn(`No races found for season ${season}`);
        return;
      }

      for (const raceData of raceTable.Races) {
        await this.syncRace(raceData, season);
      }

      logger.info(`Synced ${raceTable.Races.length} races for season ${season}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error fetching races for season ${season}`, { error: errorMessage });
      // Don't throw - allow sync to continue with other data
      logger.warn(`Continuing without race data for season ${season} - will retry on next sync`);
    }
  }

  async fetchAndSyncDrivers(season: number): Promise<void> {
    try {
      logger.info(`Fetching drivers for season ${season}`);
      const driverTable = await this.client.getDrivers(season);

      if (!driverTable.Drivers || driverTable.Drivers.length === 0) {
        logger.warn(`No drivers found for season ${season}`);
        return;
      }

      for (const driverData of driverTable.Drivers) {
        await this.syncDriver(driverData);
      }

      logger.info(`Synced ${driverTable.Drivers.length} drivers for season ${season}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error fetching drivers for season ${season}`, { error: errorMessage });
      logger.warn(`Continuing without driver data for season ${season} - will retry on next sync`);
    }
  }

  async fetchAndSyncConstructors(season: number): Promise<void> {
    try {
      logger.info(`Fetching constructors for season ${season}`);
      const constructorTable = await this.client.getConstructors(season);

      if (!constructorTable.Constructors || constructorTable.Constructors.length === 0) {
        logger.warn(`No constructors found for season ${season}`);
        return;
      }

      for (const constructorData of constructorTable.Constructors) {
        await this.syncConstructor(constructorData);
      }

      logger.info(`Synced ${constructorTable.Constructors.length} constructors for season ${season}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`Error fetching constructors for season ${season}`, { error: errorMessage });
      logger.warn(`Continuing without constructor data for season ${season} - will retry on next sync`);
    }
  }

  async fetchAndSyncCircuits(): Promise<void> {
    try {
      logger.info('Fetching circuits');
      const circuitTable = await this.client.getCircuits();

      if (!circuitTable.Circuits || circuitTable.Circuits.length === 0) {
        logger.warn('No circuits found');
        return;
      }

      for (const circuitData of circuitTable.Circuits) {
        await this.syncCircuit(circuitData);
      }

      logger.info(`Synced ${circuitTable.Circuits.length} circuits`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error fetching circuits', { error: errorMessage });
      // Don't throw - allow server to continue even if API is unavailable
      logger.warn('Continuing without circuit data - will retry on next sync');
    }
  }

  async fetchAndSyncRaceResults(season: number, round: number): Promise<void> {
    try {
      logger.info(`Fetching race results for ${season} round ${round}`);
      const raceTable = await this.client.getRaceResults(season, round);

      if (!raceTable.Races || raceTable.Races.length === 0) {
        logger.warn(`No race results found for ${season} round ${round}`);
        return;
      }

      const raceData = raceTable.Races[0];
      const race = await prisma.race.findUnique({
        where: { season_round: { season, round } },
      });

      if (!race) {
        logger.warn(`Race not found in database for ${season} round ${round}`);
        return;
      }

      if (raceData?.Results) {
        await this.syncRaceResults(race.id, raceData.Results);
      }

      logger.info(`Synced race results for ${season} round ${round}`);
    } catch (error) {
      logger.error(`Error fetching race results for ${season} round ${round}`, error);
      throw error;
    }
  }

  async fetchAndSyncQualifyingResults(season: number, round: number): Promise<void> {
    try {
      logger.info(`Fetching qualifying results for ${season} round ${round}`);
      const raceTable = await this.client.getQualifyingResults(season, round);

      if (!raceTable.Races || raceTable.Races.length === 0) {
        logger.warn(`No qualifying results found for ${season} round ${round}`);
        return;
      }

      const raceData = raceTable.Races[0];
      const race = await prisma.race.findUnique({
        where: { season_round: { season, round } },
      });

      if (!race) {
        logger.warn(`Race not found in database for ${season} round ${round}`);
        return;
      }

      if (raceData?.QualifyingResults) {
        await this.syncQualifyingResults(race.id, raceData.QualifyingResults);
      }

      logger.info(`Synced qualifying results for ${season} round ${round}`);
    } catch (error) {
      logger.error(`Error fetching qualifying results for ${season} round ${round}`, error);
      throw error;
    }
  }

  private async syncDriver(driverData: Driver): Promise<void> {
    await prisma.driver.upsert({
      where: { driverId: driverData.driverId },
      update: {
        code: driverData.code || null,
        forename: driverData.givenName,
        surname: driverData.familyName,
        dateOfBirth: driverData.dateOfBirth ? new Date(driverData.dateOfBirth) : null,
        nationality: driverData.nationality,
        url: driverData.url || null,
        permanentNumber: driverData.permanentNumber ? parseInt(driverData.permanentNumber) : null,
      },
      create: {
        driverId: driverData.driverId,
        code: driverData.code || null,
        forename: driverData.givenName,
        surname: driverData.familyName,
        dateOfBirth: driverData.dateOfBirth ? new Date(driverData.dateOfBirth) : null,
        nationality: driverData.nationality,
        url: driverData.url || null,
        permanentNumber: driverData.permanentNumber ? parseInt(driverData.permanentNumber) : null,
      },
    });
  }

  private async syncConstructor(constructorData: Constructor): Promise<void> {
    await prisma.constructor.upsert({
      where: { constructorId: constructorData.constructorId },
      update: {
        name: constructorData.name,
        nationality: constructorData.nationality,
        url: constructorData.url || null,
      },
      create: {
        constructorId: constructorData.constructorId,
        name: constructorData.name,
        nationality: constructorData.nationality,
        url: constructorData.url || null,
      },
    });
  }

  private async syncCircuit(circuitData: Circuit): Promise<void> {
    await prisma.circuit.upsert({
      where: { circuitId: circuitData.circuitId },
      update: {
        name: circuitData.circuitName,
        location: circuitData.Location.locality,
        country: circuitData.Location.country,
        lat: parseFloat(circuitData.Location.lat) || null,
        long: parseFloat(circuitData.Location.long) || null,
        url: circuitData.url || null,
      },
      create: {
        circuitId: circuitData.circuitId,
        name: circuitData.circuitName,
        location: circuitData.Location.locality,
        country: circuitData.Location.country,
        lat: parseFloat(circuitData.Location.lat) || null,
        long: parseFloat(circuitData.Location.long) || null,
        url: circuitData.url || null,
      },
    });
  }

  private async syncRace(raceData: Race, season: number): Promise<void> {
    // Ensure circuit exists
    await this.syncCircuit(raceData.Circuit);

    // Ensure season exists
    await prisma.season.upsert({
      where: { year: season },
      update: {},
      create: { year: season },
    });

    const round = parseInt(raceData.round);
    const raceDate = new Date(raceData.date);
    const sprintDate = raceData.Sprint?.date ? new Date(raceData.Sprint.date) : null;
    const qualifyingDate = raceData.Qualifying?.date ? new Date(raceData.Qualifying.date) : null;

    await prisma.race.upsert({
      where: { season_round: { season, round } },
      update: {
        raceName: raceData.raceName,
        circuitId: raceData.Circuit.circuitId,
        date: raceDate,
        time: raceData.time || null,
        sprintDate: sprintDate,
        sprintTime: raceData.Sprint?.time || null,
        qualifyingDate: qualifyingDate,
        qualifyingTime: raceData.Qualifying?.time || null,
        url: raceData.url || null,
      },
      create: {
        season,
        round,
        raceName: raceData.raceName,
        circuitId: raceData.Circuit.circuitId,
        date: raceDate,
        time: raceData.time || null,
        sprintDate: sprintDate,
        sprintTime: raceData.Sprint?.time || null,
        qualifyingDate: qualifyingDate,
        qualifyingTime: raceData.Qualifying?.time || null,
        url: raceData.url || null,
      },
    });
  }

  private async syncRaceResults(raceId: string, results: RaceResult[]): Promise<void> {
    // Delete existing results
    await prisma.raceResult.deleteMany({ where: { raceId } });

    for (const resultData of results) {
      // Ensure driver and constructor exist
      await this.syncDriver(resultData.Driver);
      await this.syncConstructor(resultData.Constructor);

      const fastestLap = resultData.FastestLap
        ? parseInt(resultData.FastestLap.lap)
        : null;
      const fastestLapTime = resultData.FastestLap?.Time?.time || null;
      const fastestLapSpeed = resultData.FastestLap?.AverageSpeed?.speed
        ? parseFloat(resultData.FastestLap.AverageSpeed.speed)
        : null;

      await prisma.raceResult.create({
        data: {
          raceId,
          driverId: resultData.Driver.driverId,
          constructorId: resultData.Constructor.constructorId,
          position: resultData.position === 'R' || resultData.position === 'D' || resultData.position === 'E'
            ? null
            : parseInt(resultData.position),
          points: parseFloat(resultData.points),
          grid: resultData.grid ? parseInt(resultData.grid) : null,
          laps: resultData.laps ? parseInt(resultData.laps) : null,
          status: resultData.status,
          time: resultData.Time?.time || null,
          milliseconds: resultData.Time?.millis ? parseInt(resultData.Time.millis) : null,
          fastestLap,
          fastestLapTime,
          fastestLapSpeed,
        },
      });
    }
  }

  private async syncQualifyingResults(raceId: string, results: QualifyingResult[]): Promise<void> {
    // Delete existing qualifying results
    await prisma.qualifyingResult.deleteMany({ where: { raceId } });

    for (const resultData of results) {
      // Ensure driver and constructor exist
      await this.syncDriver(resultData.Driver);
      await this.syncConstructor(resultData.Constructor);

      await prisma.qualifyingResult.create({
        data: {
          raceId,
          driverId: resultData.Driver.driverId,
          constructorId: resultData.Constructor.constructorId,
          position: parseInt(resultData.position),
          q1: resultData.Q1 || null,
          q2: resultData.Q2 || null,
          q3: resultData.Q3 || null,
        },
      });
    }
  }
}