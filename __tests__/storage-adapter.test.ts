import {
  exportAppStatePayload,
  importAppStatePayload,
} from '@/shared/storage/adapter';
import { createSeedState } from '@/shared/storage/seed';

describe('storage adapter payloads', () => {
  it('round-trips exported app state without losing release fields', () => {
    const seedState = createSeedState();

    const exported = exportAppStatePayload(seedState);
    const imported = importAppStatePayload(exported);

    expect(imported).toEqual(exported);
    expect(imported.schemaVersion).toBe('1');
    expect(imported.hydrationHistory).toEqual(seedState.hydrationHistory);
    expect(imported.preferences.hasSeenAppTour).toBe(
      seedState.preferences.hasSeenAppTour,
    );
  });
});
