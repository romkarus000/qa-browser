# Magnific QA Browser — настройка Git и релиза

## 1. Создайте репозиторий на GitHub

Например: `magnific-qa-browser` (private или public).

## 2. Запушьте этот код

В терминале из папки проекта:

```bash
cd /path/to/project

git remote add origin git@github.com:ВАШ_АККАУНТ/magnific-qa-browser.git
# или HTTPS:
# git remote add origin https://github.com/ВАШ_АККАУНТ/magnific-qa-browser.git

git branch -M main
git push -u origin main
```

Если репозиторий уже создан на GitHub с README — сначала:

```bash
git pull origin main --rebase
git push -u origin main
```

## 3. Первый релиз агента (установщики)

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions (`.github/workflows/release.yml`) соберёт `.dmg` и `.exe`.

После релиза обновите `web-ui/.env.production`:

```env
VITE_QA_AGENT_RELEASE_BASE=https://github.com/ВАШ_АККАУНТ/magnific-qa-browser/releases/download/v1.0.0
```

Пересоберите Web UI:

```bash
npm run build -w qa-web-ui
```

## 4. Деплой Web UI на magnific.com

Залейте содержимое `web-ui/dist/` на хостинг **того же домена**, что в CORS:

- `https://magnific.com` или
- `https://qa.magnific.com` (тогда suffix `.magnific.com` уже разрешён)

Страница может жить по пути, например: `https://magnific.com/qa-browser/`

## 5. QA на компьютере тестировщика

1. Скачать агент из Releases.
2. Установить, запустить (трей).
3. При первом запуске создаётся `~/.qa-desktop-agent/config.json` с **magnific.com** в CORS.
4. Открыть Web UI → **Connected** → **Launch local browser**.

## 6. Проверка

- Агент: http://127.0.0.1:43127/health
- Сайт открыт по **HTTPS** с домена magnific.com
- На машине установлен Google Chrome
