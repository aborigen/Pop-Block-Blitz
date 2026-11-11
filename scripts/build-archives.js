
/**
 * @fileOverview Script to generate platform-specific web archives for distribution.
 * It dynamically injects the correct SDK script tag for each platform and 
 * includes the project version in the filename.
 * Usage: node scripts/build-archives.js [yandex|vk|sber|all]
 */

const fs = require('fs');
const path = require('path');

// Move package reading into a more robust location
let version = '1.0.0';
try {
  const pkgPath = path.resolve(__dirname, '../package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    version = pkg.version;
  }
} catch (e) {
  console.warn('Could not read version from package.json, defaulting to 1.0.0');
}

const platformArg = process.argv[2] || 'all';
const outDir = path.resolve(__dirname, '../out');
const archivesDir = path.resolve(__dirname, '../archives');

// Ensure output folder exists
if (!fs.existsSync(outDir)) {
  console.error('Error: "out" directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Create archives folder if it doesn't exist
if (!fs.existsSync(archivesDir)) {
  fs.mkdirSync(archivesDir);
}

const platforms = {
  yandex: {
    filename: `pop-block-blitz-yandex-v${version}.zip`,
    label: 'Yandex Games',
    sdk: '<script src="https://yandex.ru/games/sdk/v2"></script>'
  },
  vk: {
    filename: `pop-block-blitz-vk-v${version}.zip`,
    label: 'VK Games',
    sdk: '<script src="https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"></script>'
  },
  sber: {
    filename: `pop-block-blitz-sber-v${version}.zip`,
    label: 'Sber Devices',
    sdk: '<script src="https://assistant.sberdevices.ru/sdks/canvas-app-sdk/v1/dist/index.js"></script>'
  }
};

/**
 * Creates a ZIP archive of the static export with injected SDK.
 * @param {string} key Platform key
 */
async function createArchive(key) {
  // Requirement check inside the function to avoid top-level module not found errors
  // which can be harder to debug in some build environments.
  let archiver;
  try {
    archiver = require('archiver');
  } catch (err) {
    console.error('CRITICAL: The "archiver" module is missing. Run "npm install" or check package.json.');
    process.exit(1);
  }

  const config = platforms[key];
  const zipPath = path.join(archivesDir, config.filename);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`[${config.label}] Archive created: ${config.filename} (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
      resolve();
    });

    archive.on('error', (err) => {
      console.error(`[${config.label}] Archiving error:`, err);
      reject(err);
    });

    archive.pipe(output);
    
    // 1. Handle index.html with SDK injection
    const indexPath = path.join(outDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf8');
      
      // Inject version meta tag and SDK before </head>
      const meta = `  <meta name="game-version" content="${version}">\n`;
      const injection = meta + `  ${config.sdk}\n`;

      if (html.includes('</head>')) {
        html = html.replace('</head>', `${injection}</head>`);
      } else {
        html = injection + html;
      }
      
      archive.append(html, { name: 'index.html' });
    }

    // 2. Add all other files from Next.js export folder
    archive.glob('**/*', {
      cwd: outDir,
      ignore: ['index.html']
    });
    
    archive.finalize();
  });
}

async function run() {
  console.log(`🚀 Starting platform-aware archival process for v${version}...`);
  
  try {
    if (platformArg === 'all') {
      const keys = Object.keys(platforms);
      for (const key of keys) {
        await createArchive(key);
      }
    } else if (platforms[platformArg]) {
      await createArchive(platformArg);
    } else {
      console.error(`Unknown platform: ${platformArg}. Use: yandex, vk, sber, or all.`);
      process.exit(1);
    }
    console.log('✅ Archival process completed successfully.');
  } catch (error) {
    console.error('❌ Archival process failed:', error);
    process.exit(1);
  }
}

run();
