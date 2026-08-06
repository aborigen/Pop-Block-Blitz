
# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.8.1] - 2024-05-25
### Improved
- **Animation Timing**: Introduced a 350ms delay between block popping and the cascading gravity effect. This makes the game easier to "read" and enhances the satisfying visual feedback.
- **Input Guarding**: Added a processing state to prevent clicking or rotating while the board is animating its cascade.

## [0.8.0] - 2024-05-25
### Hardened
- **Game Ready Lifecycle**: Refined the Yandex Games `reportReady` trigger to ensure it occurs only after the game UI is fully painted and interactive. Added a strategic delay to the `LoadingAPI.ready()` call to prevent any flicker or visibility of internal loading states.

## [0.7.9] - 2024-05-24
### Fixed
- **Type Safety**: Resolved the "Cannot find name 'YSDK'" TypeScript error in `yandex-games.ts` by using `any` and improving the global SDK reference strategy to be more resilient to environmental type-resolution issues.

...
