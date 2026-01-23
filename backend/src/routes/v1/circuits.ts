import { Router } from 'express';
import {
  getCircuits,
  getCircuit,
  getCircuitRaces,
} from '../../controllers/circuits-controller';

export const circuitsRouter = Router();

/**
 * @swagger
 * /api/v1/circuits/{circuitId}/races:
 *   get:
 *     summary: Get all races held at a specific circuit
 *     tags: [Circuits]
 *     parameters:
 *       - in: path
 *         name: circuitId
 *         required: true
 *         schema:
 *           type: string
 *         description: Circuit ID (e.g., bahrain, monaco)
 *     responses:
 *       200:
 *         description: Circuit races
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
 *                         circuit:
 *                           $ref: '#/components/schemas/Circuit'
 *                         races:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Race'
 *       404:
 *         description: Circuit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
circuitsRouter.get('/:circuitId/races', getCircuitRaces);

/**
 * @swagger
 * /api/v1/circuits/{circuitId}:
 *   get:
 *     summary: Get a specific circuit by ID
 *     tags: [Circuits]
 *     parameters:
 *       - in: path
 *         name: circuitId
 *         required: true
 *         schema:
 *           type: string
 *         description: Circuit ID (e.g., bahrain, monaco)
 *     responses:
 *       200:
 *         description: Circuit details
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
 *                         circuit:
 *                           $ref: '#/components/schemas/Circuit'
 *       404:
 *         description: Circuit not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
circuitsRouter.get('/:circuitId', getCircuit);

/**
 * @swagger
 * /api/v1/circuits:
 *   get:
 *     summary: Get list of all circuits
 *     tags: [Circuits]
 *     responses:
 *       200:
 *         description: List of circuits
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
 *                         circuits:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Circuit'
 */
circuitsRouter.get('/', getCircuits);