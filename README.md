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

## macOS 10.15 (Catalina) Compatibility
This project is configured to work on macOS 10.15:
1. **Node.js**: Requires Node.js 18.18.0 or later (Node 18 is the recommended version for Catalina).
2. **esbuild Fix**: We use `overrides` in `package.json` to force `esbuild@0.19.0`. This bypasses the `dyld` error (`_SecTrustCopyCertificateChain`) common on macOS 10.15.
3. **Browsers**: Optimized for Safari 13+ with CSS fallbacks for modern units and properties.

## Troubleshooting
If you still encounter `dyld` errors after clearing your `node_modules`, ensure you are using an `npm` version that supports `overrides` (npm 7+).

---
© 2024 Pop Block Blitz Studios
