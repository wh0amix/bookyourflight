import { OpenAPIV3_0 } from 'openapi-types';

export const openApiSpec: OpenAPIV3_0.Document = {
  openapi: '3.0.0',
  info: {
    title: 'BookYourFlight API',
    description: 'API pour la gestion des réservations de vols avec paiements Stripe intégrés',
    version: '1.0.0',
    contact: {
      name: 'BookYourFlight Support',
      email: 'support@bookyourflight.com',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
      description: 'Production/Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Clerk JWT Token',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique user identifier',
          },
          clerkId: {
            type: 'string',
            description: 'Clerk authentication ID',
          },
          email: {
            type: 'string',
            format: 'email',
          },
          firstName: {
            type: 'string',
            nullable: true,
          },
          lastName: {
            type: 'string',
            nullable: true,
          },
          role: {
            type: 'string',
            enum: ['USER', 'ADMIN'],
            default: 'USER',
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
      Resource: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique flight identifier',
          },
          name: {
            type: 'string',
            description: 'Flight name (e.g., "Paris to London")',
          },
          description: {
            type: 'string',
            description: 'Detailed flight description',
          },
          type: {
            type: 'string',
            description: 'Resource type',
          },
          availableSlots: {
            type: 'integer',
            description: 'Number of available seats',
          },
          maxSlots: {
            type: 'integer',
            description: 'Total capacity',
          },
          priceInCents: {
            type: 'integer',
            description: 'Price in cents (EUR)',
          },
          currency: {
            type: 'string',
            default: 'EUR',
          },
          metadata: {
            type: 'object',
            description: 'Flight metadata (origin, destination, departureTime, etc)',
            properties: {
              origin: {
                type: 'string',
              },
              destination: {
                type: 'string',
              },
              departureTime: {
                type: 'string',
                format: 'date-time',
              },
              airline: {
                type: 'string',
              },
              flightNumber: {
                type: 'string',
              },
            },
          },
          isActive: {
            type: 'boolean',
            default: true,
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
      Reservation: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique reservation identifier',
          },
          userId: {
            type: 'string',
          },
          resourceId: {
            type: 'string',
          },
          resource: {
            $ref: '#/components/schemas/Resource',
          },
          passengerCount: {
            type: 'integer',
            minimum: 1,
          },
          passengerData: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                email: {
                  type: 'string',
                  format: 'email',
                },
                dateOfBirth: {
                  type: 'string',
                  format: 'date',
                },
              },
            },
          },
          status: {
            type: 'string',
            enum: [
              'PENDING_PAYMENT',
              'CONFIRMED',
              'CANCELLED',
              'PAYMENT_FAILED',
              'EXPIRED',
            ],
          },
          totalPrice: {
            type: 'integer',
            description: 'Total price in cents',
          },
          confirmedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          cancelledAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
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
      Payment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          reservationId: {
            type: 'string',
          },
          amount: {
            type: 'integer',
            description: 'Amount in cents',
          },
          currency: {
            type: 'string',
            default: 'EUR',
          },
          status: {
            type: 'string',
            enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
          },
          stripeCheckoutSessionId: {
            type: 'string',
          },
          stripePaymentIntentId: {
            type: 'string',
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
      PaginatedResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
          },
          total: {
            type: 'integer',
          },
          page: {
            type: 'integer',
          },
          limit: {
            type: 'integer',
          },
          pages: {
            type: 'integer',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
  paths: {
    '/api/resources': {
      get: {
        tags: ['Resources'],
        summary: 'Get all available flights',
        description: 'Returns a paginated list of all active flights with optional search filtering',
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              default: 1,
            },
            description: 'Page number for pagination',
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 10,
            },
            description: 'Number of items per page',
          },
          {
            name: 'search',
            in: 'query',
            schema: {
              type: 'string',
            },
            description: 'Search in flight name, description, origin or destination',
          },
        ],
        responses: {
          '200': {
            description: 'List of flights retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Resource',
                      },
                    },
                    total: {
                      type: 'integer',
                    },
                    page: {
                      type: 'integer',
                    },
                    limit: {
                      type: 'integer',
                    },
                    pages: {
                      type: 'integer',
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Resources'],
        summary: 'Create a new flight (Admin)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: [
                  'name',
                  'description',
                  'priceInCents',
                  'maxSlots',
                  'metadata',
                ],
                properties: {
                  name: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                  priceInCents: {
                    type: 'integer',
                  },
                  maxSlots: {
                    type: 'integer',
                  },
                  metadata: {
                    type: 'object',
                    properties: {
                      origin: {
                        type: 'string',
                      },
                      destination: {
                        type: 'string',
                      },
                      departureTime: {
                        type: 'string',
                        format: 'date-time',
                      },
                      airline: {
                        type: 'string',
                      },
                      flightNumber: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Flight created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Resource',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized - Admin access required',
          },
          '403': {
            description: 'Forbidden - User is not an admin',
          },
        },
      },
    },
    '/api/resources/{id}': {
      get: {
        tags: ['Resources'],
        summary: 'Get a specific flight',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Flight details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Resource',
                },
              },
            },
          },
          '404': {
            description: 'Flight not found',
          },
        },
      },
      patch: {
        tags: ['Resources'],
        summary: 'Update a flight (Admin)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                  priceInCents: {
                    type: 'integer',
                  },
                  availableSlots: {
                    type: 'integer',
                  },
                  isActive: {
                    type: 'boolean',
                  },
                  metadata: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Flight updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Resource',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Admin only',
          },
          '404': {
            description: 'Flight not found',
          },
        },
      },
      delete: {
        tags: ['Resources'],
        summary: 'Delete a flight (Admin)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Flight deleted successfully',
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Admin only',
          },
          '404': {
            description: 'Flight not found',
          },
        },
      },
    },
    '/api/reservations': {
      get: {
        tags: ['Reservations'],
        summary: 'Get my reservations',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          '200': {
            description: 'User reservations retrieved',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reservations: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Reservation',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
        },
      },
    },
    '/api/reservations/{id}': {
      get: {
        tags: ['Reservations'],
        summary: 'Get reservation details',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        responses: {
          '200': {
            description: 'Reservation details',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Reservation',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'Reservation not found',
          },
        },
      },
      patch: {
        tags: ['Reservations'],
        summary: 'Cancel a reservation',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
          },
        ],
        requestBody: {
          required: false,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['CANCELLED'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Reservation cancelled successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Reservation',
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'Reservation not found',
          },
        },
      },
    },
    '/api/reservations/create-checkout': {
      post: {
        tags: ['Reservations', 'Payments'],
        summary: 'Create a checkout session for a reservation',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['resourceId', 'passengerCount'],
                properties: {
                  resourceId: {
                    type: 'string',
                    description: 'Flight ID to book',
                  },
                  passengerCount: {
                    type: 'integer',
                    minimum: 1,
                    description: 'Number of passengers',
                  },
                  passengerData: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: {
                          type: 'string',
                        },
                        email: {
                          type: 'string',
                          format: 'email',
                        },
                        dateOfBirth: {
                          type: 'string',
                          format: 'date',
                        },
                      },
                    },
                    description: 'Passenger details',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Checkout session created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: 'Stripe checkout session ID',
                    },
                    url: {
                      type: 'string',
                      description: 'Stripe checkout URL',
                    },
                    reservationId: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Bad request - Missing fields or invalid data',
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'Flight not found',
          },
        },
      },
    },
    '/api/reservations/verify-payment': {
      post: {
        tags: ['Reservations', 'Payments'],
        summary: 'Verify payment from Stripe webhook',
        description:
          'This endpoint is called by Stripe webhooks to confirm payment status',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  reservationId: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Payment verified',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    reservation: {
                      $ref: '#/components/schemas/Reservation',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request',
          },
          '404': {
            description: 'Reservation not found',
          },
        },
      },
    },
    '/api/admin/reservations': {
      get: {
        tags: ['Admin'],
        summary: 'Get all reservations (Admin)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: {
              type: 'integer',
              default: 1,
            },
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 20,
            },
          },
          {
            name: 'status',
            in: 'query',
            schema: {
              type: 'string',
              enum: [
                'PENDING_PAYMENT',
                'CONFIRMED',
                'CANCELLED',
                'PAYMENT_FAILED',
                'EXPIRED',
              ],
            },
            description: 'Filter by reservation status',
          },
        ],
        responses: {
          '200': {
            description: 'All reservations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    reservations: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Reservation',
                      },
                    },
                    total: {
                      type: 'integer',
                    },
                    page: {
                      type: 'integer',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Admin only',
          },
        },
      },
    },
    '/api/admin/stats': {
      get: {
        tags: ['Admin'],
        summary: 'Get dashboard statistics (Admin)',
        security: [
          {
            bearerAuth: [],
          },
        ],
        responses: {
          '200': {
            description: 'Dashboard statistics',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    totalReservations: {
                      type: 'integer',
                    },
                    confirmedReservations: {
                      type: 'integer',
                    },
                    pendingReservations: {
                      type: 'integer',
                    },
                    totalRevenue: {
                      type: 'integer',
                    },
                    totalUsers: {
                      type: 'integer',
                    },
                    totalResources: {
                      type: 'integer',
                    },
                    recentReservations: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Reservation',
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Admin only',
          },
        },
      },
    },
    '/api/webhooks/stripe': {
      post: {
        tags: ['Webhooks'],
        summary: 'Stripe webhook endpoint',
        description:
          'Receives payment events from Stripe. Must verify signature using STRIPE_WEBHOOK_SECRET',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                description: 'Stripe Event Object',
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Webhook processed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    received: {
                      type: 'boolean',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid signature',
          },
        },
      },
    },
    '/api/email/send': {
      post: {
        tags: ['Emails'],
        summary: 'Send email (Internal)',
        description:
          'Internal endpoint for sending transactional emails via Brevo',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['to', 'subject', 'htmlContent', 'type'],
                properties: {
                  to: {
                    type: 'string',
                    format: 'email',
                  },
                  subject: {
                    type: 'string',
                  },
                  htmlContent: {
                    type: 'string',
                    description: 'HTML email content',
                  },
                  type: {
                    type: 'string',
                    enum: [
                      'RESERVATION_CONFIRMATION',
                      'RESERVATION_CANCELLED',
                      'PAYMENT_REMINDER',
                    ],
                  },
                  metadata: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Email sent successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    messageId: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request',
          },
          '500': {
            description: 'Email service error',
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
};
