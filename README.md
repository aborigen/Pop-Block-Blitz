# Pop Block Blitz

A satisfying, hyper-casual block popping game built with Next.js, featuring AI-driven dynamic difficulty adjustment and a modern, playful UI.

## Features

- **Satisfying Gameplay**: Classic "pop" mechanics with smooth animations and floating point effects.
- **Adaptive AI**: Integrated with Genkit to dynamically adjust board size and color complexity based on player performance.
- **Visual Feedback**: High-impact animations, including floating scores, pulsing UI elements, and "pop-in" block effects.
- **Static Export Ready**: Configured for `next export`, making it easy to host on any static web provider.
- **Distribution Scripts**: One-click build scripts for major hypercasual platforms with automatic SDK injection.

## Build & Distribution

### Standard Build
```bash
npm run build
```
This generates a static `out/` directory ready for deployment.

### Platform Archives
Generate optimized, versioned ZIP files for specific platforms (located in the `archives/` folder). The scripts automatically inject the necessary SDK tags for each platform.

- **Yandex Games**: `npm run build:yandex`
- **VK Games**: `npm run build:vk`
- **Sber Devices**: `npm run build:sber`
- **All Platforms**: `npm run build:platforms`

The generated files will be named like `pop-block-blitz-[platform]-v1.2.2.zip`. To update the version, simply change the `version` field in `package.json`.

## macOS 10.15 (Catalina) Compatibility
This project is configured to work on macOS 10.15:
1. **Node.js**: Requires Node.js 18.18.0 or later.
2. **esbuild Fix**: We use `overrides` in `package.json` to force `esbuild@0.19.0`. This bypasses the `dyld` error (`_SecTrustCopyCertificateChain`) common on macOS 10.15.
3. **Browsers**: Optimized for Safari 13+ with CSS fallbacks for modern units and properties.

---
© 2024 Pop Block Blitz Studios
