# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.5.0] - 2024-05-24

### Added
- **Remote Configuration**: Integrated Yandex Games Remote Config to allow dynamic color palette updates directly from the developer console.
- **Enhanced Scoring**: Updated the scoring formula to `n * (n - 1) * 2`, effectively doubling the reward for clearing clusters and making high-score chasing more exciting.
- **Scoring Documentation**: Added clear, localized scoring rule explanations directly into the game's sidebar UI.

### Changed
- **UI Scaling**: Increased the size of rotation and control buttons for better accessibility and touch-friendliness.
- **Enhanced Visibility**: Significantly increased the display size of the block count indicators to make them easier to read during intense gameplay.
- **Compact Layout**: Further refined the info bar and stats sidebar to be more space-efficient, ensuring the game board remains the primary focus.

## [0.4.0] - 2024-05-24

### Added
- **Board Rotation**: Players can now rotate the game board 90 degrees left or right. This physically shifts blocks and reapplies gravity, creating new strategic possibilities.
- **Rotation Animation**: Added a smooth 400ms transition effect for board rotation using CSS transforms.
- **Block Tracking**: Added a real-time counter for remaining blocks of each color in the sidebar to help with strategic planning.

### Changed
- **Portrait Optimization**: The header bar is now hidden in portrait mode to maximize game board size. The language switcher remains accessible via the mobile-specific control panel.
- **UI Streamlining**: "Reset Session" and "Leaders" buttons are now icon-only for a cleaner, more focused interface.
- **Compact Stats**: Reduced the footprint and padding of `StatCards` to ensure the sidebar fits perfectly in landscape mode.
- **Difficulty Balancing**: Standardized the "Easy" difficulty level to start with an 8x8 grid.

### Fixed
- **Code Organization**: Extracted internal documentation from `game-logic.ts` into a separate `game-logic-docs.md` file for better maintainability.

## [0.3.0] - 2024-05-24

### Added
- **Landscape Adaptation**: Redesigned the main game layout to support a responsive landscape mode. On wider screens, game stats now move to a sidebar, allowing the game board to occupy more than 70% of the screen area.
- **Gesture Control**: Implemented `touch-action: none` and global gesture prevention to ensure smooth, uninterrupted gameplay without accidental browser navigation.

### Fixed
- **Input Handling**: Disabled the browser context menu on long-tap and right-click to prevent UI interruptions during fast-paced play.

## [0.2.2] - 2024-05-24

### Fixed
- **SDK Lifecycle**: Implemented a singleton guard for `LoadingAPI.ready()` to ensure the "game ready" signal is sent to the Yandex Games platform exactly once per session.

## [0.2.1] - 2024-05-24

### Fixed
- **SDK Readiness**: Refined the `LoadingAPI.ready()` sequence to prevent race conditions during game initialization.

### Changed
- **Automatic Localization**: The game now automatically detects and syncs with the Yandex Games environment language, setting the UI to English or Russian based on the player's platform profile.

## [0.2.0] - 2024-05-24

### Added
- **Tutorial System**: Integrated a "double-tap" finger animation that guides new players to the best move.
- **Extended Difficulty**: Added "Very Easy", "Expert", and "Insane" levels.
- **Social Integration**: Full Yandex Games Leaderboard support.
- **Game Over Effects**: Added a dynamic particle explosion.

## [0.1.0] - 2024-05-24

### Added
- **Localization**: Full support for English and Russian.
- **Sound Effects**: Procedural audio using Web Audio API for pops, clicks, and game-over states.
- **Adaptive Difficulty**: Heuristic-based difficulty adjustment.
- **Mobile Optimization**: Responsive layout and touch-friendly UI elements.

---
*Initial prototype phase completed.*
