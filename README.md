# Magnific QA Local Browser

Локальный Chrome с QA-профилями для [magnific.com](https://magnific.com).

| Часть | Описание |
|-------|----------|
| **desktop-agent** | Tray-приложение, API `127.0.0.1:43127` |
| **web-ui** | Страница выбора профилей (деплой на magnific.com) |
| **packages/agent-client** | SDK для интеграции |

## Быстрый старт (разработка)

```bash
npm install
npm run dev:agent   # терминал 1
npm run dev:ui      # терминал 2 → http://localhost:5173
```

## Продакшн

См. **[SETUP.md](SETUP.md)** — Git, релиз, деплой.

- CORS по умолчанию: `https://magnific.com`, `https://www.magnific.com`, `*.magnific.com`
- Профили: `web-ui/public/profiles.json`

## Команды

```bash
npm run build
npm run test
npm run package:mac
npm run package:win
```
