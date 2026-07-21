# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.6.6] - 2024-05-24

### Removed
- **Localization**: Removed `localStorage` persistence for language settings. The application is now fully stateless regarding localization, relying entirely on the platform environment.

## [0.6.5] - 2024-05-24

### Removed
- **UI**: Removed manual language toggle button from the control bar. Localization is now fully automatic based on the Yandex platform environment.

## [0.6.4] - 2024-05-24

### Changed
- **Localization**: Refined synchronization logic to always prioritize the Yandex Games SDK environment language on initial sync, while only persisting player preferences to `localStorage` when manually changed via the UI.
- **UI**: Re-introduced a subtle language switcher in the control bar to support manual localization overrides.

... (rest of changelog)