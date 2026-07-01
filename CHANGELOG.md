# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.2.1] - 2024-05-24

### Fixed
- **SDK Readiness**: Refined the `LoadingAPI.ready()` sequence to prevent race conditions during game initialization, ensuring a smoother loading experience on Yandex Games.

### Changed
- **Automatic Localization**: The game now automatically detects and syncs with the Yandex Games environment language, setting the UI to English or Russian based on the player's profile or browser settings.
- **Tutorial Logic**: Optimized the hint finger animation to strictly expire after the second game session, keeping the board clean for returning players.

## [0.2.0] - 2024-05-24

### Added
- **Tutorial System**: Integrated a "double-tap" index finger animation that guides new players to the best move. It automatically hides after the first two games to keep the UI clean.
- **Extended Difficulty**: Added "Very Easy", "Expert", and "Insane" levels, expanding the adaptive range to 6 distinct tiers.
- **Social Integration**: Full Yandex Games Leaderboard support with a dedicated "Leaders" button and rankings modal.
- **Game Over Effects**: Added a dynamic particle explosion that triggers when no more moves are available.
- **Marketing Assets**: Created `PROMO.md` and high-quality SVG brand assets (icon, cover, screenshot) for store listings.

### Changed
- **Visual Clarity**: Darkened the background theme to a deep navy for better contrast and block visibility.
- **Mobile Enhancements**: Doubled the size of floating score popups and stat card text on smartphone screens.
- **Legibility**: Updated floating point text to pure white for better readability against vibrant block colors.

## [0.1.0] - 2024-05-24

### Added
- **Localization**: Full support for English and Russian languages with a UI language switcher.
- **Sound Effects**: Procedural audio using Web Audio API for pops, clicks, and game-over states.
- **Visual Feedback**:
  - Floating point animations at the location of cleared blocks.
  - Score card pulse effect on point gain.
- **Adaptive Difficulty**: Heuristic-based difficulty adjustment that scales board size and color complexity based on player performance.
- **Mobile Optimization**: Responsive layout and touch-friendly UI elements for smartphone screens.

---
*Initial prototype phase completed.*
