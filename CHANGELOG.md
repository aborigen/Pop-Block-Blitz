# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [0.1.0] - 2024-05-24

### Added
- **Localization**: Full support for English and Russian languages with a UI language switcher.
- **Sound Effects**: Procedural audio using Web Audio API for pops, clicks, and game-over states.
- **Visual Feedback**:
  - Floating point animations at the location of cleared blocks.
  - Score card pulse effect on point gain.
  - 2-second persistent score increment indicator (`+X` badge).
- **Adaptive Difficulty**: Heuristic-based difficulty adjustment that scales board size and color complexity based on player performance.
- **Mobile Optimization**: Responsive layout and touch-friendly UI elements for smartphone screens.

### Changed
- **Build System**: Refactored for static web export (`next export`) compatibility.
- **Fonts**: Switched to local font serving via `next/font/google` for better performance and privacy.
- **Difficulty Logic**: Moved difficulty calculation to the client-side to support purely static environments.

### Fixed
- **SSR Hydration**: Resolved "Internal Server Error" by making the Sound Manager safe for server-side rendering.
- **Build Errors**: Removed Server Action directives that were incompatible with static export.
- **Syntax Errors**: Corrected property naming bugs in the game state logic.

---
*Initial prototype phase completed.*