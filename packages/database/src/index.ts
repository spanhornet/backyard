// Database connection
export { databaseConnection, type DatabaseConfig } from './connection';

// Models
export * from './models';

// Re-export mongoose for convenience
export { default as mongoose } from 'mongoose';
export type { Types, Schema, Model, Document } from 'mongoose';
