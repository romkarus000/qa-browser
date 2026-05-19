# QA Browser — деплой

## Репозиторий

```text
git@github.com:romkarus000/qa-browser.git
```

### Первый push (если ещё не запушено)

```bash
cd /path/to/qa-browser
git remote add origin git@github.com:romkarus000/qa-browser.git
git branch -M main
git push -u origin main
```

## 1. Релиз Desktop Agent

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions соберёт установщики. Имена файлов:

- `Magnific QA Desktop Agent-1.0.0-mac-arm64.dmg`
- `Magnific QA Desktop Agent-1.0.0-mac-x64.dmg`
- `Magnific QA Desktop Agent-1.0.0-win-x64.exe`

В `web-ui/.env.production` уже указано:

```env
VITE_QA_AGENT_RELEASE_BASE=https://github.com/romkarus000/qa-browser/releases/download/v1.0.0
```

После релиза пересоберите UI: `npm run build -w qa-web-ui`

## 2. Деплой Web UI → qa.piemnaya.ru

На сервере (46.149.70.15):

```bash
./scripts/deploy-web.sh
```

Или вручную: `npm run build -w qa-web-ui` → `rsync` в `/var/www/qa-browser/`.

Nginx: [`deploy/nginx/qa-browser.conf`](deploy/nginx/qa-browser.conf)

Панель: **https://qa.piemnaya.ru**

Важно: панель должна открываться именно с этого домена — иначе агент отклонит запрос (CORS).

## 3. QA на компьютере тестировщика

1. Скачать агент из [GitHub Releases](https://github.com/romkarus000/qa-browser/releases).
2. Установить, запустить (иконка в трее).
3. Открыть **https://qa.piemnaya.ru** → статус **Connected**.
4. **Launch local browser** → откроется Chrome на **magnific.com** с нужным UA/viewport.

## 4. Обновить CORS на уже установленных агентах

Если агент ставили раньше, отредактируйте `~/.qa-desktop-agent/config.json`:

```json
{
  "allowedOrigins": ["https://qa.piemnaya.ru"],
  "allowedHostSuffixes": [".piemnaya.ru"]
}
```

Tray → **Restart agent**.

## 5. Проверка

| Проверка | Ожидание |
|----------|----------|
| http://127.0.0.1:43127/health | `"status": "ok"` |
| Панель | https://qa.piemnaya.ru |
| После Launch | Chrome → magnific.com |
