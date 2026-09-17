import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

declare global {
  // eslint-disable-next-line no-var
  var __dbClient: postgres.Sql | undefined;
}

const connectionString = process.env.DATABASE_URL;

function createClient() {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.');
  }
  return postgres(connectionString, { prepare: false });
}

const client = global.__dbClient ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  global.__dbClient = client;
}

export const db = drizzle(client, { schema });
