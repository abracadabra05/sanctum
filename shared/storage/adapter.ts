import { openDatabaseAsync } from 'expo-sqlite';

import { migrateToLatestAppState } from '@/shared/storage/migrations';
import { appStateSchema } from '@/shared/storage/schema';
import { createSeedState } from '@/shared/storage/seed';
import type { AppState, ExportedAppState } from '@/shared/types/app';

const DATABASE_NAME = 'sanctum.db';
const STORAGE_KEY = 'app_state';

let dbPromise: ReturnType<typeof openDatabaseAsync> | null = null;

const getDatabase = async () => {
  if (!dbPromise) {
    dbPromise = openDatabaseAsync(DATABASE_NAME);
  }

  const db = await dbPromise;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_storage (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  return db;
};

export const loadAppState = async (): Promise<AppState> => {
  const db = await getDatabase();
  const record = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_storage WHERE key = ?',
    [STORAGE_KEY],
  );

  if (!record?.value) {
    return createSeedState();
  }

  const raw = JSON.parse(record.value);
  const migrated = migrateToLatestAppState(raw);
  return appStateSchema.parse(migrated);
};

export const saveAppState = async (state: AppState): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO app_storage (key, value) VALUES (?, ?)',
    [STORAGE_KEY, JSON.stringify(state)],
  );
};

export const resetAppState = async (): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM app_storage WHERE key = ?', [STORAGE_KEY]);
};

export const exportAppStatePayload = (state: AppState): ExportedAppState => ({
  ...state,
  schemaVersion: '1',
});

export const importAppStatePayload = (payload: unknown): AppState =>
  appStateSchema.parse(migrateToLatestAppState(payload));
