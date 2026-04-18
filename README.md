# Sanctum

Sanctum is an Expo Router Android-first planner for hydration, recurring tasks, habits and local-first data backup.

## Requirements

- Node.js 20+
- npm
- Android Studio / Android SDK for local Android smoke tests

## Run

```bash
npm install
npm run start
```

Useful variants:

```bash
npm run android
npm run lint
npm test
```

## Local Verification

Run the release gate before cutting an Android build:

```bash
npm run lint
npm test
npx expo export --platform android --output-dir .expo-export-check
```

## Release Checklist

1. Run lint, tests and Android export.
2. Verify onboarding, task creation/editing, habit reminders, hydration history and export/import on a physical Android device.
3. Confirm `app.json` version, Android package id and icons are correct.
4. Review EAS production profile, screenshots, privacy copy and store metadata.
5. Export local data once before destructive QA passes.

## Data Model

- Local-first storage in SQLite
- Backward-compatible JSON export/import
- No auth or cloud sync in the current release scope
