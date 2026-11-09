# VK Games SDK Implementation

This document describes the technical implementation of the VK Games SDK (VK Bridge) in **Pop Block Blitz**.

## 1. SDK Script Injection

The VK Bridge SDK is dynamically injected into the `index.html` during the build process for VK Games. This is managed by the custom archival utility.

**Injected Tag:**
```html
<script src="https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"></script>
```

## 2. Initialization

The bridge must be initialized before any other SDK calls can be made. In this project, initialization is handled in the `GameController.tsx` component to ensure it happens once the environment is ready.

**Implementation Details:**
- **Location**: `src/components/game/GameController.tsx`
- **Method**: `vkBridge.send('VKWebAppInit')`
- **Condition**: Only runs if `window.vkBridge` is present, ensuring compatibility with other platforms (Yandex, Sber) and standard web browsers.

```typescript
useEffect(() => {
  if (typeof window !== 'undefined' && (window as any).vkBridge) {
    (window as any).vkBridge.send('VKWebAppInit');
  }
}, []);
```

## 3. Platform Detection

To detect if the game is running within the VK environment, we check for the presence of the `vkBridge` object on the global `window`. This allows for graceful degradation or switching to platform-specific features (like VK-only leaderboards or invite dialogs).

## 4. Features & API Usage

### 4.1 UI & UX
The SDK can be used to control the platform's UI, such as the back button or native share dialogs.

### 4.2 Monetization (Ads)
Interstitials and rewarded videos can be invoked via the bridge using the standard VK Mini Apps events.

## 5. Deployment

For step-by-step instructions on packaging and uploading your game to the VK Developer Portal, please refer to:
- `src/docs/vk-deployment.md`

---
© 2024 Pop Block Blitz Studios
