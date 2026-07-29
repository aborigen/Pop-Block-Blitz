# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.6.7] - 2024-05-24

### Changed
- **Game Logic**: Updated `generateGrid` to ensure every color appears an even number of times, improving potential board solvability.

## [0.6.6] - 2024-05-24

### Removed
- **Localization**: Removed `localStorage` persistence for language settings. The application is now fully stateless regarding localization, relying entirely on the platform environment.

## [0.6.5] - 2024-05-24

### Removed
- **UI**: Removed manual language toggle button from the control bar. Localization is now fully automatic based on the Yandex platform environment.

...