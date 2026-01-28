import { Router } from 'express';
import {
  getConstructors,
  getConstructor,
  getConstructorResults,
  getConstructorStats,
  getConstructorsLineup,
} from '../../controllers/constructors-controller';

export const constructorsRouter = Router();

constructorsRouter.get('/lineup', getConstructorsLineup);

/**
 * @swagger
 * /api/v1/constructors/{constructorId}/results:
 *   get:
 *     summary: Get race results for a specific constructor/team
 *     tags: [Constructors]
 *     parameters:
 *       - in: path
 *         name: constructorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Constructor ID (e.g., mercedes, red_bull)
 *     responses:
 *       200:
 *         description: Constructor race results
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
 *                         constructor:
 *                           $ref: '#/components/schemas/Constructor'
 *                         results:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/RaceResult'
 *       404:
 *         description: Constructor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
constructorsRouter.get('/:constructorId/results', getConstructorResults);

/**
 * @swagger
 * /api/v1/constructors/{constructorId}/stats:
 *   get:
 *     summary: Get statistics for a specific constructor/team
 *     tags: [Constructors]
 *     parameters:
 *       - in: path
 *         name: constructorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Constructor ID (e.g., mercedes, red_bull)
 *     responses:
 *       200:
 *         description: Constructor statistics
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
 *                         constructor:
 *                           $ref: '#/components/schemas/Constructor'
 *                         totalRaces:
 *                           type: integer
 *                         totalPoints:
 *                           type: number
 *                         wins:
 *                           type: integer
 *                         podiums:
 *                           type: integer
 *       404:
 *         description: Constructor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
constructorsRouter.get('/:constructorId/stats', getConstructorStats);

/**
 * @swagger
 * /api/v1/constructors/{constructorId}:
 *   get:
 *     summary: Get a specific constructor/team by ID
 *     tags: [Constructors]
 *     parameters:
 *       - in: path
 *         name: constructorId
 *         required: true
 *         schema:
 *           type: string
 *         description: Constructor ID (e.g., mercedes, red_bull)
 *     responses:
 *       200:
 *         description: Constructor details
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
 *                         constructor:
 *                           $ref: '#/components/schemas/Constructor'
 *       404:
 *         description: Constructor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
constructorsRouter.get('/:constructorId', getConstructor);

/**
 * @swagger
 * /api/v1/constructors:
 *   get:
 *     summary: Get list of constructors/teams
 *     tags: [Constructors]
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
 *         description: List of constructors
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
 *                         constructors:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Constructor'
 *                         total:
 *                           type: integer
 *                           description: Total number of constructors matching the query
 *                         limit:
 *                           type: integer
 *                           nullable: true
 *                         offset:
 *                           type: integer
 *                           nullable: true
 */
constructorsRouter.get('/', getConstructors);