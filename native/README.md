# Drop-a-Block iOS App (React Native)

This Expo app runs Drop-a-Block directly in React Native using the shared engine logic from `src/engine` and action handling from `src/game/actions`.

## Local run

```bash
cd native
npm install
npm run start
npm run ios
```

## Build automation

- `native-ios-check.yml` validates TypeScript and performs an iOS export step.
- `native-ios-build.yml` can create a production iOS build with EAS (manual dispatch).
