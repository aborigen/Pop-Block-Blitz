/**
 * @fileOverview Utility for interacting with the Yandex Games SDK.
 * Uses official types from @types/ysdk.
 */

let sdkInstance: YSDK | null = null;
let isReadyCalled = false;

/**
 * Initializes the Yandex Games SDK.
 * Should be called once on the client side.
 */
export async function initYandexSDK(): Promise<YSDK | null> {
  if (typeof window === 'undefined') return null;
  if (sdkInstance) return sdkInstance;

  try {
    if (typeof YaGames === 'undefined') {
      console.warn('Yandex Games SDK script not found');
      return null;
    }

    const sdk = await YaGames.init();
    sdkInstance = sdk;
    console.log('Yandex Games SDK initialized', sdk.environment);
    return sdkInstance;
  } catch (e) {
    console.error('Yandex Games SDK failed to initialize:', e);
    return null;
  }
}

/**
 * Returns the environment object from the Yandex Games SDK.
 */
export function getEnvironment(): any | null {
  return sdkInstance ? sdkInstance.environment : null;
}

/**
 * Detects the language from the Yandex environment.
 * Prioritizes the platform's i18n settings.
 */
export function getLanguage(): 'en' | 'ru' | null {
  if (!sdkInstance) return null;
  
  const env = sdkInstance.environment;
  if (!env) return null;

  // Platform language (preferred)
  const sdkLang = env.i18n?.lang;
  // Browser language as fallback
  const browserLang = env.browser?.lang;
  
  const lang = sdkLang || browserLang;
  
  let detected: 'en' | 'ru' | null = null;
  if (lang) {
    const code = lang.split('-')[0].toLowerCase();
    if (code === 'ru') detected = 'ru';
    else if (code === 'en') detected = 'en';
  }
  
  console.log(`[Stage 1: Detection] SDK Lang: ${sdkLang}, Browser: ${browserLang} -> Mapped to: ${detected}`);
  return detected;
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

  if (isReadyCalled) {
    console.log('Yandex Games: reportReady already called, skipping.');
    return;
  }

  try {
    const loadingApi = (sdkInstance as any).features?.LoadingAPI || (sdkInstance as any).LoadingAPI;
    if (loadingApi && typeof loadingApi.ready === 'function') {
      loadingApi.ready();
      isReadyCalled = true;
      console.log('Yandex Games: reported ready via LoadingAPI');
    } else {
      console.warn('LoadingAPI.ready not found in SDK');
    }
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
 */
export async function reportScore(leaderboardName: string, score: number): Promise<void> {
  if (!sdkInstance) {
    console.warn('SDK not initialized. Cannot report score.');
    return;
  }

  try {
    const lb = (sdkInstance as any).leaderboards;
    if (lb && typeof lb.setScore === 'function') {
      await lb.setScore(leaderboardName, score);
      console.log(`Score ${score} reported to ${leaderboardName} via setScore`);
    } else {
      console.warn('leaderboards.setScore not available on SDK instance');
    }
  } catch (e) {
    console.warn('Could not report score:', e);
  }
}

/**
 * Fetches leaderboard entries from Yandex Games.
 */
export async function getLeaderboardEntries(leaderboardName: string): Promise<any> {
  if (!sdkInstance) {
    console.warn('SDK not initialized. Cannot fetch leaderboard.');
    return null;
  }

  try {
    const lb = (sdkInstance as any).leaderboards;
    if (lb && typeof lb.getEntries === 'function') {
      const result = await lb.getEntries(leaderboardName, {
        quantityTop: 10,
        includeUser: true,
        quantityAround: 3,
      });
      return result;
    }
  } catch (e) {
    console.warn('Could not fetch leaderboard entries:', e);
  }
  return null;
}

/**
 * Checks if the player is currently authorized.
 */
export async function isPlayerAuthorized(): Promise<boolean> {
  if (!sdkInstance) return false;
  try {
    const player = await sdkInstance.getPlayer({ scopes: false });
    return player.isAuthorized();
  } catch (e) {
    console.warn('Failed to check authorization status:', e);
    return false;
  }
}

/**
 * Opens the Yandex Games authorization dialog.
 */
export async function authorizePlayer(): Promise<boolean> {
  if (!sdkInstance) return false;
  try {
    await sdkInstance.auth.openAuthDialog();
    return true;
  } catch (e) {
    console.error('Authorization request failed:', e);
    return false;
  }
}

/**
 * Fetches remote configuration from Yandex Games.
 */
export async function getRemoteConfig(): Promise<Record<string, any> | null> {
  if (!sdkInstance) return null;

  try {
    const config = await sdkInstance.getRemoteConfig();
    return config;
  } catch (e) {
    console.warn('Failed to fetch remote config:', e);
    return null;
  }
}
