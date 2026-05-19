#!/usr/bin/env node
/**
 * Copies Playwright Chromium into build/playwright-browsers for electron-builder extraResources.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const TARGET = path.join(ROOT, 'build', 'playwright-browsers');

function rm(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

function playwrightCacheDirs() {
  return [
    path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright'),
    path.join(os.homedir(), '.cache', 'ms-playwright'),
  ];
}

function findChromiumRoot(executable) {
  let dir = path.dirname(executable);
  for (let i = 0; i < 12; i++) {
    if (path.basename(dir).startsWith('chromium-')) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function resolveChromiumSource() {
  const executable = chromium.executablePath();
  const fromExe = findChromiumRoot(executable);
  if (fromExe && fs.existsSync(fromExe)) return fromExe;

  for (const cacheRoot of playwrightCacheDirs()) {
    if (!fs.existsSync(cacheRoot)) continue;
    const match = fs.readdirSync(cacheRoot).find((name) => name.startsWith('chromium-'));
    if (match) {
      const candidate = path.join(cacheRoot, match);
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  return null;
}

function main() {
  const source = resolveChromiumSource();
  if (!source) {
    console.error('Playwright Chromium not found. Run: npm exec -w qa-desktop-agent -- playwright install chromium');
    process.exit(1);
  }

  const folderName = path.basename(source);
  const dest = path.join(TARGET, folderName);

  rm(TARGET);
  fs.mkdirSync(TARGET, { recursive: true });

  // cpSync handles macOS .app bundles and symlinks (copyFileSync does not)
  fs.cpSync(source, dest, { recursive: true, dereference: true, force: true });
  console.log(`Prepared browsers: ${dest}`);
}

main();
