# Production Deployment

## 1. Desktop Agent (per QA engineer machine)

### Install from release

1. Download DMG (macOS) or NSIS installer (Windows) from GitHub Releases.
2. Install and launch **QA Desktop Agent** (tray icon appears).
3. Edit `~/.qa-desktop-agent/config.json`:

```json
{
  "allowedOrigins": [
    "https://qa.yourcompany.com"
  ],
  "allowedHostSuffixes": [".yourcompany.com"]
}
```

4. Restart agent from tray → **Restart agent**.

### Build installers (CI)

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions workflow `.github/workflows/release.yml` produces:

- `QA-Desktop-Agent-*-mac-arm64.dmg`
- `QA-Desktop-Agent-*-mac-x64.dmg`
- `QA-Desktop-Agent-*-win-x64.exe`

### Local build

```bash
npm ci
npm run package:mac   # on macOS
npm run package:win   # on Windows
```

Artifacts: `desktop-agent/release/`

## 2. Web UI

```bash
cp web-ui/.env.production.example web-ui/.env.production
# set VITE_QA_AGENT_RELEASE_BASE

npm run build -w qa-web-ui
```

Deploy `web-ui/dist/` to your static host (S3, nginx, Vercel, etc.).

## 3. Security model

| Control | Implementation |
|---------|----------------|
| Network exposure | API binds `127.0.0.1:43127` only |
| Auth | Bearer token in local `config.json` |
| CORS | `allowedOrigins` + `allowedHostSuffixes` |
| Rate limit | 120 req/min per IP |
| Secrets in logs | Redacted (passwords, tokens, cookies) |

## 4. Operations

| Path | Purpose |
|------|---------|
| `~/.qa-desktop-agent/config.json` | Auth + CORS |
| `~/.qa-desktop-agent/logs/agent.log` | Rotated at 10 MB |
| `~/.qa-desktop-agent/profiles/<id>/browser-data/` | Per-profile Chrome data |

## 5. Requirements

- Google Chrome installed (preferred) or bundled Chromium from installer
- macOS 12+ / Windows 10+
- Outbound HTTPS to your staging apps
