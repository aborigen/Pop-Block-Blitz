/**
 * @fileOverview Utility for interacting with the Yandex Games SDK.
 */

declare global {
  interface Window {
    YaGames: any;
  }
}

let sdkInstance: any = null;

/**
 * Initializes the Yandex Games SDK.
 * Should be called once on the client side.
 */
export async function initYandexSDK() {
  if (typeof window === 'undefined') return null;
  if (sdkInstance) return sdkInstance;

  try {
    // Check if script is loaded
    if (!window.YaGames) {
      console.warn('Yandex Games SDK script not found');
      return null;
    }

    const sdk = await window.YaGames.init();
    sdkInstance = sdk;
    console.log('Yandex Games SDK initialized');
    return sdkInstance;
  } catch (e) {
    console.error('Yandex Games SDK failed to initialize:', e);
    return null;
  }
}

/**
 * Shows a full-screen interstitial ad.
 */
export function showInterstitialAd() {
  if (!sdkInstance) return;

  sdkInstance.adv.showFullscreenAdv({
    callbacks: {
      onClose: function(wasShown: boolean) {
        console.log('Ad closed, wasShown:', wasShown);
      },
      onError: function(error: any) {
        console.error('Ad error:', error);
      }
    }
  });
}

/**
 * Reports a score to a Yandex Leaderboard.
 * Note: Leaderboard must be configured in the Yandex Games Console first.
 */
export async function reportScore(leaderboardName: string, score: number) {
  if (!sdkInstance) return;

  try {
    const lb = await sdkInstance.getLeaderboards();
    await lb.setLeaderboardScore(leaderboardName, score);
    console.log(`Score ${score} reported to ${leaderboardName}`);
  } catch (e) {
    console.warn('Could not report score (player might not be authorized):', e);
  }
}
