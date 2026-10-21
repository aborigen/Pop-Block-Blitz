# Pop Block Blitz

A satisfying, hyper-casual block popping game built with Next.js, featuring AI-driven dynamic difficulty adjustment and a modern, playful UI.

## Features

- **Satisfying Gameplay**: Classic "pop" mechanics with smooth animations and floating point effects.
- **Adaptive AI**: Integrated with Genkit to dynamically adjust board size and color complexity based on player performance.
- **Visual Feedback**: High-impact animations, including floating scores, pulsing UI elements, and "pop-in" block effects.
- **Static Export Ready**: Configured for `next export`, making it easy to host on any static web provider.
- **Distribution Scripts**: One-click build scripts for major hypercasual platforms.

## Build & Distribution

### Standard Build
```bash
npm run build
```
This generates a static `out/` directory ready for deployment.

### Platform Archives
Generate optimized ZIP files for specific platforms (located in the `archives/` folder):

- **Yandex Games**: `npm run build:yandex`
- **VK Games**: `npm run build:vk`
- **Sber Devices**: `npm run build:sber`
- **All Platforms**: `npm run build:platforms`

## Compatibility
- **macOS Support**: Optimized for macOS 10.15 (Catalina) and above.
- **Node.js**: Requires Node.js 18.18.0 or later.
- **Browsers**: Supports Safari 13+, Chrome 80+, and Firefox 75+.

## Troubleshooting macOS 10.15 Errors
If you encounter `dyld: Symbol not found: _SecTrustCopyCertificateChain` during installation or development:
1. **Cause**: The `esbuild` binary provided by npm is compiled for macOS 11+.
2. **Solution**: Force npm to use an older esbuild version: `npm install esbuild@0.19.0 --save-exact`

## Game Logic
The game uses a "Match-2" or "Collapse" mechanic. 
- Click groups of 2 or more adjacent blocks of the same color to pop them.
- Gravity pulls blocks down to fill empty spaces.
- Empty columns are shifted left to consolidate the board.
- **Scoring**: `Score = n * (n - 1) * 2`

---
© 2024 Pop Block Blitz Studios
