# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

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

## [0.9.9] - 2024-05-25
### Added
- **Refined Controls**: Reorganized control bar with tactile physical depth for buttons.
- **Manual Hint**: Integrated a manual lightbulb icon to trigger AI hints on demand.

## [0.9.8] - 2024-05-25
### Added
- **Visual Polish**: Refined block graphics with 3D depth, gloss overlays, and tactile "pressed" animations for a physical "Popit" toy aesthetic.
- **UI Refinement**: Optimized shape icons for better visibility and contrast.

## [0.9.7] - 2024-05-25
### Fixed
- **OS Hardening**: Added `README.md` troubleshooting for `esbuild` dyld errors specific to macOS 10.15.
- **Dev Script**: Removed `--turbopack` from `npm run dev` to reduce reliance on incompatible binaries for legacy systems.

## [0.9.6] - 2024-05-25
### Added
- **OS Compatibility**: Added CSS fallbacks for `dvh` and `aspect-ratio` to ensure the game board displays correctly on macOS 10.15 (Safari 13/14).
- **Legacy Browser Support**: Integrated `-webkit-` prefixes for key animations and transitions to support older WebKit engines.

## [0.9.5] - 2024-05-25
### Fixed
- **Platform Bridge Resolution**: Eliminated `setViewVisible` runtime error by purging all residual platform-specific bridge calls.
- **Initialization Logic**: Hardened the component mounting sequence to ensure stable performance in standalone web environments.
