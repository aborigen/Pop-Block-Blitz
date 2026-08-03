# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.7.1] - 2024-05-24
### Refined
- **Viewport Adaptation**: Optimized the game layout for various screen sizes using `h-[100dvh]` and improved aspect-ratio constraints to prevent bottom cut-off on mobile devices.

## [0.7.0] - 2024-05-24

### Added
- **New Rule**: Added the "Perfect Clear" bonus. If the player empties the entire board, their final score is multiplied by 5.
- **UI**: Added a "PERFECT CLEAR!" celebratory message to the game over screen.

## [0.6.7] - 2024-05-24

### Changed
- **Game Logic**: Updated `generateGrid` to ensure every color appears an even number of times, improving potential board solvability.

## [0.6.6] - 2024-05-24

### Removed
- **Localization**: Removed `localStorage` persistence for language settings. The application is now fully stateless regarding localization, relying entirely on the platform environment.

...
