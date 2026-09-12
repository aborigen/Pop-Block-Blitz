
# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.9.6] - 2024-05-25
### Added
- **OS Compatibility**: Added CSS fallbacks for `dvh` and `aspect-ratio` to ensure the game board displays correctly on macOS 10.15 (Safari 13/14).
- **Legacy Browser Support**: Integrated `-webkit-` prefixes for key animations and transitions to support older WebKit engines.

## [0.9.5] - 2024-05-25
### Fixed
- **Platform Bridge Resolution**: Eliminated `setViewVisible` runtime error by purging all residual platform-specific bridge calls.
- **Initialization Logic**: Hardened the component mounting sequence to ensure stable performance in standalone web environments.

## [0.9.4] - 2024-05-25
### Fixed
- **SDK Decoupling**: Completely removed all runtime references to the Yandex Games SDK to resolve global initialization errors.
- **Standalone Mode**: The game now runs perfectly as a standalone web application using local persistence.

## [0.9.3] - 2024-05-25
### Added
- **Dissolve Effect**: Blocks now disappear with a custom "dissolve" animation featuring scaling, brightness boost, and blurring for a more satisfying tactile feel.

## [0.9.2] - 2024-05-25
### Improved
- **Header UI**: Removed text label from the "Reset Session" button, converting it to a clean icon-only button for consistency and better space utilization.

## [0.9.1] - 2024-05-25
### Improved
- **Scaling Logic**: Overhauled the board scaling strategy to ensure it occupies the maximum possible screen area across all devices while maintaining aspect ratio.
- **Portrait Stats**: Further compacted the portrait stats to a single horizontal strip.
