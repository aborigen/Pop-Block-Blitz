# Game Localization Localization Sync with Yandex Games

This document explains how **Pop Block Blitz** synchronizes its user interface language with the Yandex Games environment.

## Overview

The localization system is designed to be fully session-based and "Yandex-first". It ensures the game language matches the platform environment without requiring persistent local storage for manual overrides.

## The Sync Process

The synchronization happens in three main stages:

### 1. Detection (`src/lib/yandex-games.ts`)
The `getLanguage()` utility function extracts the language code from the Yandex Games SDK environment:
- It checks `sdkInstance.environment.i18n.lang` (platform language).
- Fallback to browser language if platform language is unavailable.

### 2. Initialization (`src/components/game/GameController.tsx`)
In the main game controller, a `useEffect` hook runs on mount:
- **Immediate Experience**: The app starts with a language based on a heuristic check of browser settings (`navigator.language`).
- **SDK Priority**: Once the Yandex SDK is ready, the app **always** calls `setLocale(sdkLang)`. This ensures the UI matches the platform immediately for the current session.

### 3. Application (`src/lib/i18n/context.tsx`)
The `LanguageProvider` handles the global state:
- `setLocale(lang)` is the primary interface.
- **Purely Reactive**: The `setLocale` function updates the reactive state used by components to fetch localized strings.
- **Stateless**: No manual preferences are stored in `localStorage`. The game will re-synchronize with the platform on every fresh load, ensuring accuracy if the user's platform settings change.

## Summary of Logic
1. **Initial Load**: Guess language from browser `navigator.language`.
2. **SDK Ready**: Always force UI to match Yandex SDK language.
3. **No Persistence**: Localization is entirely driven by the current environment and session, eliminating the need for `localStorage` for language settings.

---
© 2024 Pop Block Blitz Studios