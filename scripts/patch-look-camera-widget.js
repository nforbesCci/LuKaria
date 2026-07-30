/**
 * Patches @3dlook/camera-widget-react bugs:
 * - Calls $audio.current.pause() when the ref's .current is still null
 *   (ref object is truthy, so their `n.$audio &&` guard is insufficient)
 */
const fs = require('fs');
const path = require('path');

const target = path.join(
  __dirname,
  '..',
  'node_modules',
  '@3dlook',
  'camera-widget-react',
  'dist',
  'index.js',
);

if (!fs.existsSync(target)) {
  console.warn('[patch-look-camera-widget] Package not installed, skipping');
  process.exit(0);
}

let source = fs.readFileSync(target, 'utf8');
const original = source;

const replacements = [
  [
    'n.$audio&&(n.$audio.current.pause(),n.connectToSpeaker(n.$audio,20))',
    'n.$audio&&n.$audio.current&&(n.$audio.current.pause(),n.connectToSpeaker(n.$audio,20))',
  ],
  [
    'i||c||n.$audio.current.pause()',
    'i||c||n.$audio.current&&n.$audio.current.pause()',
  ],
];

let applied = 0;
for (const [from, to] of replacements) {
  if (source.includes(to)) {
    applied += 1; // already patched
    continue;
  }
  if (!source.includes(from)) {
    console.warn('[patch-look-camera-widget] Pattern not found:', from.slice(0, 60));
    continue;
  }
  source = source.replace(from, to);
  applied += 1;
}

if (source !== original) {
  fs.writeFileSync(target, source);
  console.log(`[patch-look-camera-widget] Patched ${applied} site(s) in dist/index.js`);
} else if (applied > 0) {
  console.log('[patch-look-camera-widget] Already patched');
} else {
  console.warn('[patch-look-camera-widget] No patches applied');
}
