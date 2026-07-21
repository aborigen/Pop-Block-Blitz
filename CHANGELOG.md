# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.6.1] - 2024-05-24

### Changed
- **Leaderboard**: Ensured the score is successfully reported to Yandex Games before displaying the leaderboard modal on game over, preventing rank synchronization delays.

## [0.6.0] - 2024-05-24

### Changed
- **Localization**: Updated the default UI language to Russian ('ru').

## [0.5.9] - 2024-05-24

### Removed
- **Localization**: Removed the manual language selection buttons from the UI. The game now relies fully on automatic platform/environment detection for localization.

## [0.5.8] - 2024-05-24

### Removed
- **UI**: Removed the copyright text footer from the main game page for a cleaner look.

## [0.5.7] - 2024-05-24

### Added
- **Debugging**: Added console messages to all three localization synchronization stages (Detection, Initialization, Application) to improve traceability.

## [0.5.6] - 2024-05-24

### Added
- **Documentation**: Created `src/docs/localization-sync.md` explaining the synchronization between game localization and the Yandex Games environment language parameter.

## [0.5.5] - 2024-05-24

### Improved
- **Board Sizing**: Refined board scaling logic to utilize more of the available screen space while maintaining aspect ratio.
- **Mobile Layout**: Further compacted the statistics panel on mobile devices to prioritize vertical space for the game board.
- **UI Responsiveness**: Adjusted flexbox constraints to prevent any potential overlapping in edge-case screen sizes.

## [0.5.4] - 2024-05-24

### Fixed
- **Board Rotation Consistency**: Refactor the rotation sequence to suppress transitions during internal state swaps, preventing visual flickering and accidental counter-animations.
- **State Synchronization**: Improved the coordination between visual rotation and gravity cascade for a smoother "snap-and-drop" feel.

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
