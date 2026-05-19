# QA Desktop Agent

Electron tray application — local API on `127.0.0.1:43127` for launching Chrome with QA profiles.

## Production build

```bash
npm run prepare:release   # icons + bundle Chromium + compile
npm run package:mac       # macOS DMG (run on macOS)
npm run package:win       # Windows NSIS (run on Windows)
```

Installers are written to `release/`.

## Configuration

Copy `config.example.json` to `~/.qa-desktop-agent/config.json` and set your company's origins.

## Development

```bash
npm run dev
```
