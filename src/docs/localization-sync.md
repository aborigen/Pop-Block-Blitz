# Game Localization Sync with Yandex Games

This document explains how **Pop Block Blitz** synchronizes its user interface language with the Yandex Games environment.

## Overview

The localization system is designed to be "Yandex-first" while allowing for persistent manual overrides.

## The Sync Process

The synchronization happens in three main stages:

### 1. Detection (`src/lib/yandex-games.ts`)
The `getLanguage()` utility function extracts the language code from the Yandex Games SDK environment:
- It checks `sdkInstance.environment.i18n.lang` (platform language).
- Fallback to browser language if platform language is unavailable.

### 2. Initialization (`src/components/game/GameController.tsx`)
In the main game controller, a `useEffect` hook runs on mount:
- **Immediate Experience**: The app starts with a language based on a heuristic check of browser settings or a previously saved manual locale.
- **SDK Priority**: Once the Yandex SDK is ready, the app **always** calls `setLocale(sdkLang, false)`. This ensures the UI matches the platform immediately. 
- **Non-Persistent Sync**: The `false` flag prevents the automatic platform sync from overwriting the user's `localStorage` permanent preference.

### 3. Application (`src/lib/i18n/context.tsx`)
The `LanguageProvider` handles the global state:
- `setLocale(lang, persist)` is the primary interface.
- **Manual Change**: If a player clicks the language toggle in the UI, `persist` is `true`, and the preference is saved to `localStorage`.
- **Automatic Sync**: During the initial SDK sync, `persist` is `false`, so the change is only for the current session (unless the player has no manual preference yet).

## Summary of Logic
1. **Initial Load**: Check `localStorage`. If empty, guess language from browser.
2. **SDK Ready**: Always force UI to match Yandex SDK language (non-persistent).
3. **Player Action**: If the player manually toggles language, save that choice to `localStorage` permanently.

This logic ensures the game feels native to the Yandex platform while giving power-users the ability to override the language permanently.

---
© 2024 Pop Block Blitz Studios
