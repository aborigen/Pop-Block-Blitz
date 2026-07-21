# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.6.4] - 2024-05-24

### Changed
- **Localization**: Refined synchronization logic to always prioritize the Yandex Games SDK environment language on initial sync, while only persisting player preferences to `localStorage` when manually changed via the UI.
- **UI**: Re-introduced a subtle language switcher in the control bar to support manual localization overrides.

## [0.6.3] - 2024-05-24

### Changed
- **Localization**: Removed hardcoded `lang="en"` from `layout.tsx`. The `lang` attribute is now dynamically synced with the application's locale via the `LanguageProvider`.

... (rest of changelog)
