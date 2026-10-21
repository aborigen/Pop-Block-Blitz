/**
 * @fileOverview Script to generate platform-specific web archives for distribution.
 * Usage: node scripts/build-archives.js [yandex|vk|sber|all]
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

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
    filename: 'pop-block-blitz-yandex.zip',
    label: 'Yandex Games'
  },
  vk: {
    filename: 'pop-block-blitz-vk.zip',
    label: 'VK Games'
  },
  sber: {
    filename: 'pop-block-blitz-sber.zip',
    label: 'Sber Devices'
  }
};

/**
 * Creates a ZIP archive of the static export.
 * @param {string} key Platform key
 */
async function createArchive(key) {
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
    
    // Add all files from Next.js export folder to the root of the ZIP
    archive.directory(outDir, false);
    
    archive.finalize();
  });
}

async function run() {
  console.log('🚀 Starting platform archival process...');
  
  try {
    if (platformArg === 'all') {
      const tasks = Object.keys(platforms).map(key => createArchive(key));
      await Promise.all(tasks);
    } else if (platforms[platformArg]) {
      await createArchive(platformArg);
    } else {
      console.error(`Unknown platform: ${platformArg}. Use: yandex, vk, sber, or all.`);
      process.exit(1);
    }
    console.log('✅ Archival process completed successfully.');
  } catch (error) {
    console.error('❌ Archival process failed.');
    process.exit(1);
  }
}

run();
