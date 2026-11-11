
# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

## [1.2.4] - 2024-05-25
### Added
- **Swipe Gestures**: Implemented touch-screen swipe gestures for board rotation (Left for CCW, Right for CW).
- **Responsive Handling**: Optimized touch interaction on the main game board with a displacement threshold to prevent accidental rotations.

## [1.2.3] - 2024-05-25
### Added
- **VK Deployment**: Added `npm run deploy:vk` script and `src/docs/vk-deployment.md` guide.
- **Improved Workflow**: Integrated versioned ZIP creation into the deployment command output.

## [1.2.2] - 2024-05-25
### Fixed
- **OS Compatibility**: Automated the `esbuild` fix for macOS 10.15 by adding an `overrides` field in `package.json` to force version `0.19.0`.
- **CSS**: Reinforced `-webkit-` prefixes and unit fallbacks for Safari 13/14 compatibility.

## [1.2.1] - 2024-05-25
### Added
- **Documentation**: Created `src/docs/genkit-overview.md` to explain the AI integration and tech stack for the Adaptive Game Master.

## [1.2.0] - 2024-05-25
### Added
- **Dynamic SDK Injection**: Refactored `scripts/build-archives.js` to automatically inject platform-specific SDK scripts (Yandex SDK, VK Bridge, Sber Canvas SDK) into `index.html` during the zipping process.
- **Improved Pipeline**: Cleanly separates distribution builds while keeping the local `out/` directory generic.

## [1.1.0] - 2024-05-25
### Added
- **Distribution Scripts**: Added specialized build commands to generate ZIP archives for Yandex Games, VK Games, and Sber Devices.
- **Archival Utility**: Created `scripts/build-archives.js` to automate high-compression packaging.

## [1.0.0] - 2024-05-25
### Added
- **Score Visual Effects**: Implemented explosive score updates with particle bursts and impact flashes.
- **HUD Polish**: Refined the statistics panel with tactile hit animations.
- **Milestone**: Full release of the core hypercasual game framework.
