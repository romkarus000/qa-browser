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

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function main() {
  const executable = chromium.executablePath();
  // .../chromium-XXXX/chrome-linux/chrome -> browser root is two levels up from chrome binary parent
  const browserDir = path.dirname(path.dirname(executable));
  const cacheRoot = path.join(os.homedir(), '.cache', 'ms-playwright');
  const folderName = path.basename(browserDir);

  let source = browserDir;
  if (!fs.existsSync(source) && fs.existsSync(cacheRoot)) {
    const match = fs
      .readdirSync(cacheRoot)
      .find((name) => name.startsWith('chromium-'));
    if (match) source = path.join(cacheRoot, match);
  }

  if (!fs.existsSync(source)) {
    console.error('Playwright Chromium not found. Run: npx playwright install chromium');
    process.exit(1);
  }

  rm(TARGET);
  fs.mkdirSync(TARGET, { recursive: true });
  copyDir(source, path.join(TARGET, folderName));
  console.log(`Prepared browsers: ${path.join(TARGET, folderName)}`);
}

main();
