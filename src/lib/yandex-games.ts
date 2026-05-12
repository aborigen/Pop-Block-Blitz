/**
 * @fileOverview Utility for interacting with the Yandex Games SDK.
 * Uses official types from @types/ysdk.
 */

let sdkInstance: YSDK | null = null;

/**
 * Initializes the Yandex Games SDK.
 * Should be called once on the client side.
 */
export async function initYandexSDK(): Promise<YSDK | null> {
  if (typeof window === 'undefined') return null;
  if (sdkInstance) return sdkInstance;

  try {
    // YaGames is provided as a global by the SDK script and typed via @types/ysdk
    if (typeof YaGames === 'undefined') {
      console.warn('Yandex Games SDK script not found');
      return null;
    }

    const sdk = await YaGames.init();
    sdkInstance = sdk;
    console.log('Yandex Games SDK initialized');
    return sdkInstance;
  } catch (e) {
    console.error('Yandex Games SDK failed to initialize:', e);
    return null;
  }
}

/**
 * Reports that the game is ready to be played.
 * This hides the loading screen in Yandex Games.
 */
export function reportReady(): void {
  if (!sdkInstance) {
    console.warn('SDK not initialized. Cannot report ready.');
    return;
  }

  try {
    // @ts-ignore - The types might be slightly out of date for the latest features
    sdkInstance.features.LoadingAPI?.ready();
    console.log('Yandex Games: reported ready');
  } catch (e) {
    console.warn('Failed to report ready:', e);
  }
}

/**
 * Shows a full-screen interstitial ad.
 */
export function showInterstitialAd(): void {
  if (!sdkInstance) {
    console.warn('SDK not initialized. Cannot show ad.');
    return;
  }

  sdkInstance.adv.showFullscreenAdv({
    callbacks: {
      onClose: (wasShown: boolean) => {
        console.log('Ad closed, wasShown:', wasShown);
      },
      onError: (error: string) => {
        console.error('Ad error:', error);
      }
    }
  });
}

/**
 * Reports a score to a Yandex Leaderboard.
 * Note: Leaderboard must be configured in the Yandex Games Console first.
 */
export async function reportScore(leaderboardName: string, score: number): Promise<void> {
  if (!sdkInstance) {
    console.warn('SDK not initialized. Cannot report score.');
    return;
  }

  try {
    const lb = await sdkInstance.getLeaderboards();
    await lb.setLeaderboardScore(leaderboardName, score);
    console.log(`Score ${score} reported to ${leaderboardName}`);
  } catch (e) {
    console.warn('Could not report score (player might not be authorized or leaderboard missing):', e);
  }
}
