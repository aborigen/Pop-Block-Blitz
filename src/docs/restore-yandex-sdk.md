# Restoring Yandex Games SDK Integration

This guide provides the necessary code and steps to restore the Yandex Games SDK integration for **Pop Block Blitz**.

## 1. Add Dependencies
Run `npm install @types/ysdk` to add the Yandex Games SDK types.

## 2. Restore the SDK Script
Add the Yandex SDK script to `src/app/layout.tsx`:

```tsx
import Script from 'next/script';

// Inside RootLayout head/return
<Script 
  src="https://yandex.ru/games/sdk/v2" 
  strategy="beforeInteractive"
/>
```

## 3. Re-create the Utility Library
Create `src/lib/yandex-games.ts` with the following content:

```ts
/**
 * @fileOverview Utility for interacting with the Yandex Games SDK.
 */

let sdkInstance: any | null = null;
let isReadyCalled = false;

export async function initYandexSDK(): Promise<any | null> {
  if (typeof window === 'undefined') return null;
  if (sdkInstance) return sdkInstance;
  try {
    const yaGames = (window as any).YaGames;
    if (!yaGames) return null;
    const sdk = await yaGames.init();
    sdkInstance = sdk;
    return sdkInstance;
  } catch (e) {
    return null;
  }
}

export function getLanguage(): 'en' | 'ru' | null {
  if (!sdkInstance) return null;
  const env = sdkInstance.environment;
  const rawLang = env.i18n?.lang || env.browser?.lang;
  if (rawLang) {
    const code = rawLang.split('-')[0].toLowerCase();
    return (code === 'ru' || code === 'en') ? code : null;
  }
  return null;
}

export function reportReady(): void {
  if (!sdkInstance || isReadyCalled) return;
  try {
    const loadingApi = (sdkInstance as any).features?.LoadingAPI || (sdkInstance as any).LoadingAPI;
    if (loadingApi?.ready) {
      loadingApi.ready();
      isReadyCalled = true;
    }
  } catch (e) {}
}

export async function reportScore(leaderboardName: string, score: number): Promise<void> {
  if (!sdkInstance) return;
  try {
    const lb = (sdkInstance as any).leaderboards;
    if (lb?.setScore) await lb.setScore(leaderboardName, score);
  } catch (e) {}
}

export async function getLeaderboardEntries(leaderboardName: string): Promise<any> {
  if (!sdkInstance) return null;
  try {
    const lb = (sdkInstance as any).leaderboards;
    if (lb?.getEntries) return await lb.getEntries(leaderboardName, { quantityTop: 10, includeUser: true });
  } catch (e) {}
  return null;
}

export async function isPlayerAuthorized(): Promise<boolean> {
  if (!sdkInstance) return false;
  try {
    const player = await sdkInstance.getPlayer({ scopes: false });
    return player.isAuthorized();
  } catch (e) { return false; }
}

export async function authorizePlayer(): Promise<boolean> {
  if (!sdkInstance) return false;
  try {
    await sdkInstance.auth.openAuthDialog();
    return true;
  } catch (e) { return false; }
}
```

## 4. Hook Up the Controller
In `src/components/game/GameController.tsx`, re-import the utilities and add the `useEffect` hooks for initialization and reporting.

## 5. Update Leaderboard Modal
Re-implement the fetching and authorization logic in `LeaderboardModal.tsx` using the functions in the restored `yandex-games.ts`.
