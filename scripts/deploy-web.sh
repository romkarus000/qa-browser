#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Building web-ui..."
cd "$ROOT"
npm run build -w qa-web-ui

echo "Deploying to /var/www/qa-browser..."
rsync -av --delete "$ROOT/web-ui/dist/" /var/www/qa-browser/
chown -R www-data:www-data /var/www/qa-browser

if command -v nginx >/dev/null; then
  nginx -t && systemctl reload nginx
fi

echo "Done: https://qa.piemnaya.ru"
