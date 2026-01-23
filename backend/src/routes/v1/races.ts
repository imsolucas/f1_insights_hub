import { Router } from 'express';
import {
  getRaces,
  getRace,
  getRaceResults,
  getQualifyingResults,
  getCurrentSeasonSchedule,
} from '../../controllers/races-controller';

export const racesRouter = Router();

/**
 * @swagger
 * /api/v1/races/current/schedule:
 *   get:
 *     summary: Get current season race schedule
 *     tags: [Races]
 *     responses:
 *       200:
 *         description: Current season race schedule
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         races:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Race'
 */
racesRouter.get('/current/schedule', getCurrentSeasonSchedule);

/**
 * @swagger
 * /api/v1/races/{raceId}/results:
 *   get:
 *     summary: Get race results for a specific race
 *     tags: [Races]
 *     parameters:
 *       - in: path
 *         name: raceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Race ID (CUID)
 *     responses:
 *       200:
 *         description: Race results
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         race:
 *                           $ref: '#/components/schemas/Race'
 *                         results:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/RaceResult'
 *       404:
 *         description: Race not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
racesRouter.get('/:raceId/results', getRaceResults);

/**
 * @swagger
 * /api/v1/races/{raceId}/qualifying:
 *   get:
 *     summary: Get qualifying results for a specific race
 *     tags: [Races]
 *     parameters:
 *       - in: path
 *         name: raceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Race ID (CUID)
 *     responses:
 *       200:
 *         description: Qualifying results
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         race:
 *                           $ref: '#/components/schemas/Race'
 *                         results:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/QualifyingResult'
 *       404:
 *         description: Race not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
racesRouter.get('/:raceId/qualifying', getQualifyingResults);

/**
 * @swagger
 * /api/v1/races/{raceId}:
 *   get:
 *     summary: Get a specific race by ID
 *     tags: [Races]
 *     parameters:
 *       - in: path
 *         name: raceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Race ID (CUID)
 *     responses:
 *       200:
 *         description: Race details
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         race:
 *                           $ref: '#/components/schemas/Race'
 *       404:
 *         description: Race not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
racesRouter.get('/:raceId', getRace);

/**
 * @swagger
 * /api/v1/races:
 *   get:
 *     summary: Get list of races
 *     tags: [Races]
 *     parameters:
 *       - in: query
 *         name: season
 *         schema:
 *           type: integer
 *           minimum: 1950
 *         description: Filter by season year
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Maximum number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: List of races
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         races:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Race'
 *                         total:
 *                           type: integer
 *                           description: Total number of races matching the query
 *                         limit:
 *                           type: integer
 *                           nullable: true
 *                         offset:
 *                           type: integer
 *                           nullable: true
 */
racesRouter.get('/', getRaces);