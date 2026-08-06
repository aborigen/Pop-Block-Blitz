# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.7.9] - 2024-05-24
### Fixed
- **Type Safety**: Resolved the "Cannot find name 'YSDK'" TypeScript error in `yandex-games.ts` by using `any` and improving the global SDK reference strategy to be more resilient to environmental type-resolution issues.

## [0.7.8] - 2024-05-24
### Fixed
- **Leaderboard Stability**: Implemented a defensive avatar resolution strategy in `LeaderboardModal` to prevent crashes when the Yandex SDK returns player objects without `getAvatarSrc` or with the alternate `getPhoto` method.

## [0.7.7] - 2024-05-24
### Improved
- **Environment Sync**: Audited and hardened the Yandex Games environment auto-definition process for robust locale detection.
- **Logging**: Added detailed sync lifecycle logging for easier platform debugging.

...