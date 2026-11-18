# Pop Block Blitz - Version History

Detailed record of milestones, features, and fixes for the Pop Block Blitz project.

## [1.2.5] - 2024-05-25
### Fixed
- **Build Pipeline**: Refactored `scripts/build-archives.js` to lazily load the `archiver` module, preventing "Module not found" errors during initial environment scans.
- **Dependencies**: Moved `archiver` to core dependencies to ensure availability in all build environments.
- **Git Hygiene**: Added `.gitignore` to exclude `archives/` and `vk-hosting-config.json`.

## [1.2.4] - 2024-05-25
### Added
- **Swipe & Drag Gestures**: Implemented unified horizontal swipe (touch) and drag (mouse) detection on the game board.
- **Rotation Interaction**: Swiping Right/Dragging Right rotates clockwise; Left rotates counter-clockwise.
- **UX Tuning**: Added a 50px displacement threshold to prevent accidental rotations during rapid tapping/popping.

## [1.2.3] - 2024-05-25
### Added
- **VK Games Deployment**: Integrated `npm run deploy:vk` script and created the `src/docs/vk-deployment.md` guide.
- **SDK Initialization**: Added mandatory `VKWebAppInit` call in `GameController.tsx` for platform activation.
- **Platform Documentation**: Created `src/docs/vk-sdk-implementation.md`.

## [1.2.2] - 2024-05-25
### Added
- **UI Refinement**: Added **Tile Styles** (Popit, Classic, Glass) selectable in the settings.
- **Settings Modal**: Consolidated sound toggles and visual style preferences into a single modal.
- **Persistence**: Tile style and sound preferences are now saved to `localStorage`.

## [1.2.1] - 2024-05-25
### Added
- **Difficulty Selection**: Added a manual level selector in the Game Over dialog, allowing players to override AI recommendations.
- **Balanced Configs**: Defined specific board sizes and color counts for all 6 difficulty levels.

## [1.2.0] - 2024-05-25
### Added
- **Adaptive AI Master**: Integrated Genkit-powered DDA (Dynamic Difficulty Adjustment) system.
- **AI Feedback**: Real-time reasoning from the AI Master is displayed in the HUD.

## [1.1.0] - 2024-05-25
### Added
- **Platform Archiving**: Created `scripts/build-archives.js` to generate optimized ZIPs with dynamic SDK injection for Yandex, VK, and Sber.
- **Localization**: Full support for English and Russian UI strings.

## [1.0.0] - 2024-05-25
### Added
- **Core Release**: Full implementation of the Match-2 collapse mechanic.
- **Visual Effects**: Particle bursts, floating scores, and tactile "Popit" animations.
- **Sound Engine**: Procedural Web Audio API synthesizer for satisfying pop and click sounds.

---
© 2024 Pop Block Blitz Studios
