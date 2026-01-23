import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'F1 Insight Hub API',
      version: '1.0.0',
      description: 'API documentation for F1 Insight Hub - Formula 1 race data, statistics, and insights',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            correlationId: {
              type: 'string',
              example: 'clx1234567890',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['success', 'data', 'correlationId', 'timestamp'],
        },
        ApiError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'NOT_FOUND',
                },
                message: {
                  type: 'string',
                  example: 'Resource not found',
                },
                details: {
                  type: 'object',
                },
              },
              required: ['code', 'message'],
            },
            correlationId: {
              type: 'string',
              example: 'clx1234567890',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['success', 'error', 'correlationId', 'timestamp'],
        },
        Race: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            season: {
              type: 'integer',
              example: 2024,
            },
            round: {
              type: 'integer',
              example: 1,
            },
            raceName: {
              type: 'string',
              example: 'Bahrain Grand Prix',
            },
            circuit: {
              $ref: '#/components/schemas/Circuit',
            },
            date: {
              type: 'string',
              format: 'date',
              example: '2024-03-02',
            },
            time: {
              type: 'string',
              nullable: true,
              example: '15:00:00Z',
            },
            sprintDate: {
              type: 'string',
              format: 'date',
              nullable: true,
            },
            sprintTime: {
              type: 'string',
              nullable: true,
            },
            qualifyingDate: {
              type: 'string',
              format: 'date',
              nullable: true,
            },
            qualifyingTime: {
              type: 'string',
              nullable: true,
            },
            url: {
              type: 'string',
              nullable: true,
            },
          },
        },
        Circuit: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            circuitId: {
              type: 'string',
              example: 'bahrain',
            },
            name: {
              type: 'string',
              example: 'Bahrain International Circuit',
            },
            location: {
              type: 'string',
              example: 'Sakhir',
            },
            country: {
              type: 'string',
              example: 'Bahrain',
            },
            lat: {
              type: 'number',
              nullable: true,
              example: 26.0325,
            },
            long: {
              type: 'number',
              nullable: true,
              example: 50.5106,
            },
            alt: {
              type: 'number',
              nullable: true,
              example: 0,
            },
            url: {
              type: 'string',
              nullable: true,
            },
          },
        },
        Driver: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            driverId: {
              type: 'string',
              example: 'hamilton',
            },
            code: {
              type: 'string',
              nullable: true,
              example: 'HAM',
            },
            forename: {
              type: 'string',
              example: 'Lewis',
            },
            surname: {
              type: 'string',
              example: 'Hamilton',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              nullable: true,
              example: '1985-01-07',
            },
            nationality: {
              type: 'string',
              example: 'British',
            },
            url: {
              type: 'string',
              nullable: true,
            },
            permanentNumber: {
              type: 'integer',
              nullable: true,
              example: 44,
            },
          },
        },
        Constructor: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            constructorId: {
              type: 'string',
              example: 'mercedes',
            },
            name: {
              type: 'string',
              example: 'Mercedes',
            },
            nationality: {
              type: 'string',
              example: 'German',
            },
            url: {
              type: 'string',
              nullable: true,
            },
          },
        },
        RaceResult: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            position: {
              type: 'integer',
              nullable: true,
              example: 1,
            },
            points: {
              type: 'number',
              example: 25,
            },
            grid: {
              type: 'integer',
              nullable: true,
              example: 1,
            },
            laps: {
              type: 'integer',
              nullable: true,
              example: 57,
            },
            status: {
              type: 'string',
              example: 'Finished',
            },
            time: {
              type: 'string',
              nullable: true,
              example: '1:31:27.729',
            },
            driver: {
              $ref: '#/components/schemas/Driver',
            },
            constructor: {
              $ref: '#/components/schemas/Constructor',
            },
          },
        },
        QualifyingResult: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clx1234567890',
            },
            position: {
              type: 'integer',
              example: 1,
            },
            q1: {
              type: 'string',
              nullable: true,
              example: '1:29.845',
            },
            q2: {
              type: 'string',
              nullable: true,
              example: '1:28.998',
            },
            q3: {
              type: 'string',
              nullable: true,
              example: '1:28.179',
            },
            driver: {
              $ref: '#/components/schemas/Driver',
            },
            constructor: {
              $ref: '#/components/schemas/Constructor',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Races',
        description: 'Race information and results',
      },
      {
        name: 'Drivers',
        description: 'Driver information and statistics',
      },
      {
        name: 'Constructors',
        description: 'Constructor/team information and statistics',
      },
      {
        name: 'Circuits',
        description: 'Circuit/track information',
      },
    ],
  },
  apis: ['./src/routes/**/*.ts', './src/controllers/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
