
# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.9.2] - 2024-05-25
### Improved
- **Header UI**: Removed text label from the "Reset Session" button, converting it to a clean icon-only button for consistency and better space utilization.

## [0.9.1] - 2024-05-25
### Improved
- **Scaling Logic**: Overhauled the board scaling strategy to ensure it occupies the maximum possible screen area across all devices while maintaining aspect ratio.
- **Portrait Stats**: Further compacted the portrait stats to a single horizontal strip.

## [0.9.0] - 2024-05-25
### Refactored
- **UI Architecture**: Major refactor of the game controller layout to provide a cleaner visual hierarchy and better responsive behavior in both orientations.

## [0.8.9] - 2024-05-25
### Added
- **Tutorial Level**: Integrated a "Very Easy" starting difficulty with a 6x6 grid and 3 colors to help new players learn the mechanics.
- **Improved Scaling**: Updated the difficulty heuristic to allow scaling down to 6x6 for struggling players.

## [0.8.8] - 2024-05-25
### Verified
- **Game Ready Lifecycle**: Re-confirmed and hardened the Yandex Games `reportReady` trigger. The call to `LoadingAPI.ready()` is precisely timed to occur 200ms after the game is mounted, the SDK is initialized, and the interactive grid is rendered, ensuring no loading screens block gameplay.

## [0.8.7] - 2024-05-25
### Improved
- **UI Styling**: Increased the horizontal padding of the "Reset Session" button in the game header to make it more distinct and easier to click.
