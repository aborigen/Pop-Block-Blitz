
# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.7.8] - 2024-05-24
### Fixed
- **Leaderboard Stability**: Implemented a defensive avatar resolution strategy in `LeaderboardModal` to prevent crashes when the Yandex SDK returns player objects without `getAvatarSrc` or with the alternate `getPhoto` method.

## [0.7.7] - 2024-05-24
### Improved
- **Environment Sync**: Audited and hardened the Yandex Games environment auto-definition process for robust locale detection.
- **Logging**: Added detailed sync lifecycle logging for easier platform debugging.

## [0.7.6] - 2024-05-24
### Added
- **SDK Documentation**: Detailed explanation of the `reportReady` implementation for Yandex Games SDK synchronization.

...
