# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.5.3] - 2024-05-24

### Refactored
- **Board Rotation Animation**: Re-engineered the rotation sequence to include a "lift" scale effect and refined state synchronization for more tactile feedback.
- **Gravity Timing**: Optimized the delay between visual rotation and gravity cascade to ensure a smooth, satisfying settling of blocks.

## [0.5.2] - 2024-05-24

### Changed
- **UI Layout**: Moved the "Reset Session" button to the right side of the control bar to better group it with primary action controls.
- **UI Consistency**: Standardized button sizes and improved ARIA labels for better accessibility.

## [0.5.1] - 2024-05-24

### Fixed
- **SDK Compatibility**: Replaced deprecated `Player.getMode()` with `Player.isAuthorized()` in Yandex Games SDK integration.

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

---
*Initial prototype phase completed.*
