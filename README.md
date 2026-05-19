# QA Browser

Локальный Chrome с QA-профилями для команды Magnific.

| Роль | URL |
|------|-----|
| **Панель** (Web UI) | [qa.piemnaya.ru](https://qa.piemnaya.ru) |
| **Тестируемый сайт** (открывается в Chrome) | [magnific.com](https://magnific.com) |
| **Репозиторий** | [github.com/romkarus000/qa-browser](https://github.com/romkarus000/qa-browser) |

## Разработка

```bash
npm install
npm run dev:agent   # терминал 1
npm run dev:ui      # терминал 2 → http://localhost:5173
```

## Продакшн

См. **[SETUP.md](SETUP.md)**.

- CORS агента: `https://qa.piemnaya.ru`, `*.piemnaya.ru`
- Профили (куда идёт браузер): `web-ui/public/profiles.json` → `https://magnific.com/`
