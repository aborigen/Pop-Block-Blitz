# Changelog

All notable changes to the **Pop Block Blitz** project will be documented in this file.

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
...