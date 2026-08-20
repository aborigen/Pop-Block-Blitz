
# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.8.6] - 2024-05-25
### Added
- **Session Persistence**: Implemented automatic mid-game state saving. Progress (grid, score, moves) is now persisted to `localStorage` after every move and restored on page refresh.
- **Immediate Leaderboard Sync**: High scores are now reported to the Yandex Games SDK leaderboard immediately upon achievement, ensuring cross-session reliability.
- **Manual Save Button**: Added a "Save" icon to the game header for explicit manual progress synchronization.

## [0.8.5] - 2024-05-25
### Improved
- **Hint System**: Optimized the hint lifecycle. Hints now automatically disappear after 3 full sequential cycles of the top 3 moves, ensuring a balance between helpful onboarding and non-intrusive gameplay.

## [0.8.4] - 2024-05-25
### Improved
- **Sequential Hints**: Refined the visual onboarding to display the top 3 largest possible moves in a sequential cycle (every 2 seconds) instead of showing them all at once. This makes the UI cleaner while still guiding new players through multiple options.

## [0.8.3] - 2024-05-25
### Improved
- **Hint System**: Enhanced the visual onboarding by showing the top 3 largest possible moves simultaneously at the start of a session, instead of just one. Each hinted group now features a finger icon to clearly guide new players.

## [0.8.2] - 2024-05-25
### Fixed
- **Launch Synchronization**: Hardened the initialization logic in `GameController` to ensure automatic language synchronization via the Yandex SDK happens exactly once during the launch sequence. Removed reactive dependencies that could cause mid-game language resets, providing a more stable and platform-compliant experience.

## [0.8.1] - 2024-05-25
### Improved
- **Animation Timing**: Introduced a 350ms delay between block popping and the cascading gravity effect. This makes the game easier to "read" and enhances the satisfying visual feedback.
- **Input Guarding**: Added a processing state to prevent clicking or rotating while the board is animating its cascade.

## [0.8.0] - 2024-05-25
### Hardened
- **Game Ready Lifecycle**: Refined the Yandex Games `reportReady` trigger to ensure it occurs only after the game UI is fully painted and interactive. Added a strategic delay to the `LoadingAPI.ready()` call to prevent any flicker or visibility of internal loading states.
