# Game Localization Sync with Yandex Games

This document explains how **Pop Block Blitz** synchronizes its user interface language with the Yandex Games environment.

## Overview

The localization system is designed to be "Yandex-first" while respecting player preferences. It ensures that when a player opens the game through the Yandex Games platform, the UI automatically matches their platform settings (Russian or English).

## The Sync Process

The synchronization happens in three main stages:

### 1. Detection (`src/lib/yandex-games.ts`)
The `getLanguage()` utility function extracts the language code from the Yandex Games SDK environment:
- It first checks `sdkInstance.environment.i18n.lang` (the platform's language).
- If that's unavailable, it falls back to `sdkInstance.environment.browser.lang`.
- It strips country codes (e.g., `ru-RU` becomes `ru`) and maps them to our supported locales (`en`, `ru`).

### 2. Initialization (`src/components/game/GameController.tsx`)
In the main game controller, a `useEffect` hook runs on mount:
- **Local Priority**: It first checks `localStorage` for a previously saved locale (`app-locale`). This allows players to manually override the language and have it persist.
- **SDK Sync**: If no local preference exists, it waits for the Yandex SDK to initialize. Once ready, it calls `getLanguage()` and updates the game's locale using `setLocale`.

### 3. Application (`src/lib/i18n/context.tsx`)
The `LanguageProvider` manages the global state:
- When `setLocale` is called, the state updates.
- This triggers a re-render of all components using the `useTranslation` hook.
- The UI instantly switches to the correct dictionary defined in `src/lib/i18n/dictionaries.ts`.

## Summary of Logic
1. **Does `localStorage` have a locale?**
   - **Yes**: Use it.
   - **No**: Wait for Yandex SDK.
2. **Is Yandex SDK language available?**
   - **Yes**: Use Yandex environment language.
   - **No**: Default to English.

This logic ensures a seamless experience for Yandex users while providing flexibility for all players.

---
© 2024 Pop Block Blitz Studios