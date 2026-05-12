# Yandex Games SDK Integration Guide

This project is pre-configured to work with the Yandex Games SDK. Below are the details of the implementation and the steps required to go live.

## 1. SDK Implementation Details

### Script Loading
The SDK script is loaded in `src/app/layout.tsx` using the Next.js `Script` component with `beforeInteractive` strategy to ensure it's available as early as possible.

### Utility Wrapper
A dedicated utility at `src/lib/yandex-games.ts` handles:
- **Initialization**: `initYandexSDK()` connects the app to the Yandex environment.
- **Interstitial Ads**: `showInterstitialAd()` triggers a full-screen ad.
- **Leaderboards**: `reportScore(leaderboardName, score)` submits player scores using the `ysdk.getLeaderboards().setLeaderboardScore()` pattern.

### Integration Points
- **Initialization**: Called in `GameController.tsx` via `useEffect` on mount.
- **Game Over**: When the game ends, `showInterstitialAd()` is called and the score is reported to a leaderboard named `'leaders'`.

## 2. Yandex Console Configuration

To make these features functional in production, you must configure your game in the [Yandex Games Console](https://games.yandex.com/console/):

### General Setup
1. Create a new game draft.
2. Fill in the required metadata (Title, Description, Icons).
3. Upload your static build (the contents of the `out/` folder after running `npm run build`).

### Advertising
- Interstitial ads are enabled by default once the SDK is initialized. Note that they won't appear in the local development environment unless the domain is verified by Yandex.

### Leaderboards
1. In the console, navigate to the **Leaderboards** section.
2. Create a new leaderboard.
3. **Important**: The name in the console must match the string passed to `reportScore` in `GameController.tsx` (currently set to `'leaders'`).
4. Set the "Score type" to "Numeric" and the "Order" to "Descending".

## 3. Local Testing
The SDK uses `window.parent` to communicate. When testing locally:
- Ads may fail to load or report errors in the console.
- Score reporting will fail if the player is not authorized via Yandex.
- For full testing, use the **Draft** preview feature in the Yandex Games Console.

## 4. Troubleshooting
- **"YaGames is not defined"**: Ensure the script in `layout.tsx` is loading correctly.
- **Ad not showing**: Yandex limits how often ads can be shown (usually once every 60-120 seconds per user). Check the browser console for `wasShown: false`.
- **Leaderboard error**: Verify the leaderboard name matches exactly between the code and the Yandex Console.
