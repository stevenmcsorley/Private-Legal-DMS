import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  
  // Security
  SESSION_SECRET: Joi.string().min(32).required(),
  
  // Database
  DATABASE_URL: Joi.string().required(),
  
  // Redis
  REDIS_URL: Joi.string().required(),
  
  // MinIO
  MINIO_ENDPOINT: Joi.string().required(),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_USE_SSL: Joi.string().valid('true', 'false').default('false'),
  
  // OpenSearch
  OPENSEARCH_URL: Joi.string().required(),
  
  // Keycloak
  KEYCLOAK_ISSUER: Joi.string().uri().required(),
  KEYCLOAK_CLIENT_ID: Joi.string().required(),
  KEYCLOAK_CLIENT_SECRET: Joi.string().required(),
  
  // OPA
  OPA_URL: Joi.string().uri().required(),
  
  // External services
  TIKA_URL: Joi.string().uri().required(),
  CLAMAV_HOST: Joi.string().required(),
  CLAMAV_PORT: Joi.number().default(3310),
  
  // Frontend
  FRONTEND_URL: Joi.string().uri().default('http://localhost'),
  ONLYOFFICE_URL: Joi.string().uri().default('http://localhost:8082'),
});