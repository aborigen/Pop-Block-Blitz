# VK Games Deployment Guide

This guide explains how to deploy **Pop Block Blitz** to the VK Games (VK Mini Apps) platform.

## 1. Prerequisites
- A VK account.
- Access to the [VK Developers Portal](https://vk.com/apps?act=manage).

## 2. Platform-Specific Integration
The project uses the **VK Bridge** SDK for communication with the VK platform.

### SDK Injection
When you run `npm run build:vk` or `npm run deploy:vk`, the following script is automatically injected into your `index.html`:
```html
<script src="https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"></script>
```

### Initializing the Bridge
You should initialize the bridge as early as possible in your application. In **Pop Block Blitz**, this is handled in the `GameController.tsx` (or a dedicated wrapper) once the environment is detected:
```javascript
if (typeof vkBridge !== 'undefined') {
  vkBridge.send('VKWebAppInit');
}
```

## 3. Deployment Steps

### Step 1: Generate the Archive
Run the deployment command:
```bash
npm run deploy:vk
```
This will build the project and create a versioned ZIP file in the `archives/` directory (e.g., `pop-block-blitz-vk-v1.2.3.zip`).

### Step 2: Create a New App on VK
1. Go to the [VK Developers Portal](https://vk.com/apps?act=manage).
2. Click **Create Application**.
3. Set the type to **Game** and the category to **Direct Games**.

### Step 3: Upload the Build
1. In your app settings, navigate to the **Hosting** or **Loading** section.
2. Under "Direct Games", upload the ZIP file generated in Step 1.
3. Set the **Mobile version URL** to point to the uploaded index file.

## 4. Testing
- Use the **Mobile Sandbox** feature in the VK portal to test your game on a mobile device.
- The `vk-bridge` calls will only work when the game is running inside the VK app environment.

## 5. Troubleshooting
- **White Screen**: Ensure the `assetPrefix` in `next.config.ts` is set correctly for relative paths (this project is pre-configured for this).
- **SDK not found**: Verify that the SDK script was injected into the `index.html` inside the ZIP archive.

---
© 2024 Pop Block Blitz Studios
