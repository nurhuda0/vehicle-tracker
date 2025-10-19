import { Options } from 'swagger-jsdoc';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vehicle Tracker API',
      version: '1.0.0',
      description: 'API documentation for Vehicle Tracker Dashboard',
      contact: {
        name: 'API Support',
        email: 'support@vehicletracker.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Vehicle: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            plateNumber: {
              type: 'string',
            },
            model: {
              type: 'string',
            },
            brand: {
              type: 'string',
            },
            year: {
              type: 'integer',
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'maintenance'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        VehicleStatus: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            vehicleId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: ['trip', 'idle', 'stopped'],
            },
            latitude: {
              type: 'number',
            },
            longitude: {
              type: 'number',
            },
            speed: {
              type: 'number',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            status: {
              type: 'integer',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};
