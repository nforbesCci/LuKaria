const fs = require('fs');
const path = require('path');

const src = path.join(
  __dirname,
  '..',
  'node_modules',
  '@3dlook',
  'camera-widget-react',
  'dist',
  'widget-assets',
);
const dest = path.join(__dirname, '..', 'public', 'widget-assets');

if (!fs.existsSync(src)) {
  console.warn('[copy-look-camera-assets] Source missing:', src);
  process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });
console.log('[copy-look-camera-assets] Copied widget assets to public/widget-assets');
