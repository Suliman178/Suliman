import { JsonStore } from './jsonStore.js';
import { PostgresStore } from './postgresStore.js';

export type AppStore = JsonStore | PostgresStore;
export const store: AppStore = process.env.DATABASE_URL ? new PostgresStore(process.env.DATABASE_URL) : new JsonStore();
export const persistenceMode = process.env.DATABASE_URL ? 'postgres' : 'json-file';
