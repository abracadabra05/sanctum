# Releasing Sanctum

This repository is set up to keep source code clean and ship Android builds through GitHub Releases.

## 1. Preflight

Run the release gate locally before cutting any build:

```bash
npm run release:check
```

That command runs:

- `npm run lint`
- `npm test`
- `npm run export:android`

## 2. Build a Preview APK

Use the internal Android profile to generate a shareable APK:

```bash
npx eas build --platform android --profile preview --local --output dist/Sanctum-preview.apk --non-interactive
```

Notes:

- `dist/` is ignored by git, so the APK stays out of source control.
- `preview` produces an `.apk`, while `production` is reserved for the store-ready Android App Bundle.
- Local EAS builds require Android SDK, Java and an authenticated Expo/EAS session.

## 3. Publish on GitHub

Create a new GitHub Release and attach `dist/Sanctum-preview.apk` as the binary asset.

Recommended release title:

```text
Sanctum v1.0.0
```

Recommended release body:

```md
## Highlights

- Android-first planner for hydration, tasks and recurring habits
- Local-first storage with JSON export/import
- Interactive onboarding for the first task and habit
- English and Russian interface

## Included asset

- `Sanctum-preview.apk` for direct Android installation

## Verification

- Lint passed
- Tests passed
- Android export smoke check passed
```

## 4. Keep the Repository Clean

- Do not commit APK files into the repository history.
- Put binaries in GitHub Releases, not in the repo root.
- Keep `README.md` aligned with the actual release asset name and install flow.
