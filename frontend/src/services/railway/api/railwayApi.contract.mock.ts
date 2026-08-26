/**
 * Railway API Contract Check - Task 3
 * 
 * This script validates that the frontend API client matches the expected
 * Railway API contract schema. When the VSRSystemsBackend OpenAPI schema
 * is available, run:
 *
 *   npm run generate:railway-api -- --schema ../../VSRSystemsBackend/artifacts/openapi/railway.json
 *   npm run check:railway-api
 *
 * Until then, this file documents the expected contract shape and provides
 * a mock schema for development-time validation.
 */

// Expected Railway API OpenAPI schema structure (generated from VSRSystemsBackend)
export type RailwayApiSpec = {
  openapi: string
  info: {
    title: string
    version: string
    description: string
  }
  servers?: { url: string; description?: string }[]
  tags: RailwayApiTag[]
  paths: RailwayApiPaths
  components: {
    schemas: RailwaySchemas
    securitySchemes: Record<string, any>
  }
  security?: Array<{ [key: string]: string }>
}

// API Tag definitions per capability
export type RailwayApiTag = {
  name: string
  description: string
}

// Paths grouped by capability
export type RailwayApiPaths = {
  '/api/railway/capabilities': {
    get: {
      responses: {
        '200': {
          description: 'Railway capabilities'
          content: {
            'application/json': {
              schema: RailwayCapabilitiesSchema
            }
          }
        }
      }
    }
  }
  '/api/railway/inspections': {
    get: {
      responses: {
        '200': {
          description: 'Inspections list'
          content: {
            'application/json': {
              schema: { type: 'object'; properties: { items: { type: 'array' } }; additionalProperties: false }
            }
          }
        }
      }
    }
    post: {
      requestBody: {
        required: true
        content: {
          'application/json': {
            schema: InspectionCreateSchema
          }
        }
      }
      responses: {
        '201': {
          description: 'Inspection created'
        }
        '400': {
          description: 'Validation error'
        }
      }
    }
  }
  '/api/railway/defects': {
    get: {
      responses: {
        '200': {
          description: 'Defects list'
        }
      }
    }
    post: {
      requestBody: {
        required: true
        content: {
          'application/json': {
            schema: DefectCreateSchema
          }
        }
      }
      responses: {
        '201': {
          description: 'Defect created'
        }
      }
    }
  }
  '/api/railway/work-orders': {
    get: {
      responses: {
        '200': {
          description: 'Work orders list'
          parameters: [
            {
              name: 'status'
              in: 'query'
              schema: { type: 'string' }
            }
          ]
        }
      }
    }
    post: {
      requestBody: {
        required: true
        content: {
          'application/json': {
            schema: WorkOrderCreateSchema
          }
        }
      }
      responses: {
        '201': {
          description: 'Work order created'
        }
      }
    }
  }
  '/api/railway/crowd': {
    get: {
      responses: {
        '200': {
          description: 'Crowd observations'
        }
      }
    }
    post: {
      requestBody: {
        required: true
        content: {
          'application/json': {
            schema: CrowdObservationCreateSchema
          }
        }
      }
      responses: {
        '201': {
          description: 'Crowd observation created'
        }
      }
    }
  }
  '/api/railway/offline-sync': {
    post: {
      requestBody: {
        required: true
        content: {
          'application/json': {
            schema: OfflineSyncRequestSchema
          }
        }
      }
      responses: {
        '200': {
          description: 'Sync results'
          content: {
            'application/json': {
              schema: OfflineSyncResponseSchema
            }
          }
        }
        '409': {
          description: 'Conflict - local state diverged'
        }
      }
    }
  }
  '/api/railway/capabilities': {
    get: {
      responses: {
        '200': {
          description: 'Feature capabilities'
          content: {
            'application/json': {
              schema: CapabilitiesResponseSchema
            }
          }
        }
      }
    }
  }
}

// Schema placeholders - populated when backend schema is available
export type RailwayCapabilitiesSchema = {
  inspections: boolean
  defects: boolean
  maintenance: boolean
  crowd: boolean
  offline: boolean
  realtime: boolean
}

export type InspectionCreateSchema = {
  templateVersion: string
  targetStationId: string
  expectedVersion: number
}

export type DefectCreateSchema = {
  inspectionRunId: string
  severity: string
  description: string
  location?: string
}

export type WorkOrderCreateSchema = {
  sourceId: string
  priority: string
  assignedTo: string
  expectedVersion: number
}

export type CrowdObservationCreateSchema = {
  stationId: string
  zoneId: string
  count: number
  confidence: number
  sourceType: string
}

export type OfflineSyncRequestSchema = {
  idempotencyKey: string
  commands: readonly {
    commandId: string
    type: string
    payload: unknown
    expectedVersion: number
  }[]
}

export type OfflineSyncResponseSchema = {
  accepted: readonly string[]
  rejected: readonly {
    commandId: string
    reason: string
  }
  conflicted: readonly {
    commandId: string
    localVersion: number
    serverVersion: number
  }
  total: number
}

export type CapabilitiesResponseSchema = {
  railwayEnabled: boolean
  inspectionEnabled: boolean
  maintenanceEnabled: boolean
  crowdEnabled: boolean
  offlinePackMaxAgeHours: number
  maxEvidenceBytes: number
  allowedEvidenceTypes: readonly string[]
}

// Mock schema for development until backend is available
export const MOCK_RAILWAY_API_SPEC: RailwayApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'VSR Railway API',
    version: '1.0.0',
    description: 'VSR Railway Top Three Modules API',
  },
  tags: [
    { name: 'railway', description: 'Railway network management' },
    { name: 'inspections', description: 'Inspection and defect workflows' },
    { name: 'maintenance', description: 'Maintenance and work order workflows' },
    { name: 'crowd', description: 'Crowd operations and ingestion' },
    { name: 'offline', description: 'Offline sync and PWA workflows' },
  ],
  paths: {
    '/api/railway/capabilities': {
      get: {
        responses: {
          '200': {
            description: 'Railway capabilities',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    railwayEnabled: { type: 'boolean' },
                    inspectionEnabled: { type: 'boolean' },
                    maintenanceEnabled: { type: 'boolean' },
                    crowdEnabled: { type: 'boolean' },
                    offlinePackMaxAgeHours: { type: 'integer', minimum: 1, maximum: 168 },
                    maxEvidenceBytes: { type: 'integer', minimum: 1024, maximum: 10485760 },
                    allowedEvidenceTypes: {
                      type: 'array',
                      items: { type: 'string' },
                      uniqueItems: true,
                    },
                  },
                  required: [
                    'railwayEnabled',
                    'inspectionEnabled',
                    'maintenanceEnabled',
                    'crowdEnabled',
                    'offlinePackMaxAgeHours',
                    'maxEvidenceBytes',
                    'allowedEvidenceTypes',
                  ],
                  additionalProperties: false,
                },
              },
            },
            examples: {
              'application/json': {
                value: {
                  railwayEnabled: true,
                  inspectionEnabled: true,
                  maintenanceEnabled: false,
                  crowdEnabled: false,
                  offlinePackMaxAgeHours: 72,
                  maxEvidenceBytes: 5242880,
                  allowedEvidenceTypes: ['image/jpeg', 'image/png', 'application/pdf'],
                },
              },
            },
          },
        },
      },
    },
    '/api/railway/inspections': {
      get: {
        responses: {
          '200': {
            description: 'Inspections list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          templateVersion: { type: 'string' },
                          stationId: { type: 'string' },
                          status: { type: 'string' },
                          severity: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                        required: ['id', 'templateVersion', 'stationId', 'status'],
                        additionalProperties: false,
                      },
                    },
                    total: { type: 'integer', minimum: 0 },
                  },
                  required: ['items', 'total'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/api/railway/defects': {
      get: {
        responses: {
          '200': {
            description: 'Defects list',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          inspectionRunId: { type: 'string' },
                          severity: { type: 'string' },
                          status: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                        required: ['id', 'inspectionRunId', 'severity', 'status'],
                        additionalProperties: false,
                      },
                    },
                    total: { type: 'integer', minimum: 0 },
                  },
                  required: ['items', 'total'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/api/railway/work-orders': {
      get: {
        responses: {
          '200': {
            description: 'Work orders list',
            parameters: [
              {
                name: 'status',
                in: 'query',
                schema: { type: 'string' },
              },
            ],
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          sourceId: { type: 'string' },
                          priority: { type: 'string' },
                          status: { type: 'string' },
                          assignedTo: { type: 'string' },
                          createdAt: { type: 'string', format: 'date-time' },
                        },
                        required: ['id', 'sourceId', 'priority', 'status'],
                        additionalProperties: false,
                      },
                    },
                    total: { type: 'integer', minimum: 0 },
                  },
                  required: ['items', 'total'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/api/railway/crowd': {
      get: {
        responses: {
          '200': {
            description: 'Crowd observations',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    items: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          stationId: { type: 'string' },
                          zoneId: { type: 'string' },
                          count: { type: 'integer' },
                          confidence: { type: 'number' },
                          sourceType: { type: 'string' },
                          recordedAt: { type: 'string', format: 'date-time' },
                        },
                        required: ['id', 'stationId', 'zoneId', 'count', 'confidence', 'sourceType'],
                        additionalProperties: false,
                      },
                    },
                    total: { type: 'integer', minimum: 0 },
                  },
                  required: ['items', 'total'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/api/railway/offline-sync': {
      post: {
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idempotencyKey', 'commands'],
                properties: {
                  idempotencyKey: { type: 'string' },
                  commands: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['commandId', 'type', 'payload', 'expectedVersion'],
                      properties: {
                        commandId: { type: 'string' },
                        type: { type: 'string' },
                        payload: { type: 'object' },
                        expectedVersion: { type: 'integer', minimum: 0 },
                      },
                      additionalProperties: false,
                    },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Sync results',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    accepted: {
                      type: 'array',
                      items: { type: 'string' },
                      description: 'Command IDs accepted by server',
                    },
                    rejected: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          commandId: { type: 'string' },
                          reason: { type: 'string' },
                        },
                      },
                      items: { minItems: 1 },
                    },
                    conflicted: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          commandId: { type: 'string' },
                          localVersion: { type: 'integer', minimum: 0 },
                          serverVersion: { type: 'integer', minimum: 0 },
                        },
                        required: ['commandId', 'localVersion', 'serverVersion'],
                        additionalProperties: false,
                      },
                      items: { minItems: 1 },
                    },
                    total: { type: 'integer', minimum: 0 },
                  },
                  required: ['accepted', 'rejected', 'conflicted', 'total'],
                  additionalProperties: false,
                },
              },
            },
          },
          '409': {
            description: 'Conflict - local state diverged',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string' },
                    message: { type: 'string' },
                  },
                  required: ['error', 'message'],
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
    '/api/railway/capabilities': {
      get: {
        responses: {
          '200': {
            description: 'Feature capabilities',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    railwayEnabled: { type: 'boolean' },
                    inspectionEnabled: { type: 'boolean' },
                    maintenanceEnabled: { type: 'boolean' },
                    crowdEnabled: { type: 'boolean' },
                    offlinePackMaxAgeHours: { type: 'integer' },
                    maxEvidenceBytes: { type: 'integer' },
                    allowedEvidenceTypes: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                  additionalProperties: false,
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      RailwayCapabilitiesSchema: {
        type: 'object',
        properties: {
          railwayEnabled: { type: 'boolean' },
          inspectionEnabled: { type: 'boolean' },
          maintenanceEnabled: { type: 'boolean' },
          crowdEnabled: { type: 'boolean' },
          offlinePackMaxAgeHours: { type: 'integer', minimum: 1, maximum: 168 },
          maxEvidenceBytes: { type: 'integer', minimum: 1024, maximum: 10485760 },
          allowedEvidenceTypes: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
          },
        },
        required: [
          'railwayEnabled',
          'inspectionEnabled',
          'maintenanceEnabled',
          'crowdEnabled',
          'offlinePackMaxAgeHours',
          'maxEvidenceBytes',
          'allowedEvidenceTypes',
        ],
        additionalProperties: false,
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
}