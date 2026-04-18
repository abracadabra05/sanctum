import { migrateToLatestAppState } from '@/shared/storage/migrations';
import { createSeedState } from '@/shared/storage/seed';

describe('app state migrations', () => {
  it('normalizes legacy task categories without archivedAt', () => {
    const seedState = createSeedState();
    const legacyPayload = {
      ...seedState,
      taskCategories: seedState.taskCategories.map((category, index) =>
        index === 0
          ? {
              id: category.id,
              label: category.label,
              color: category.color,
              kind: category.kind,
              archived: category.archived,
            }
          : category,
      ),
    };

    const migrated = migrateToLatestAppState(legacyPayload);

    expect(migrated.taskCategories[0]).toMatchObject({
      id: seedState.taskCategories[0]?.id,
      archivedAt: null,
    });
  });
});
