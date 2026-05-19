# Установка на macOS (Catalina и новее)

## Ошибка «приложение повреждено»

После скачивания из Chrome macOS ставит метку **quarantine**. Это не поломка файла.

### Решение (Терминал)

```bash
xattr -cr ~/Downloads/Magnific\ QA\ Desktop\ Agent.app
open ~/Downloads/Magnific\ QA\ Desktop\ Agent.app
```

Если приложение в «Программы»:

```bash
xattr -cr "/Applications/Magnific QA Desktop Agent.app"
```

### Альтернатива без Терминала

1. **Правый клик** по `Magnific QA Desktop Agent.app` → **Открыть** → **Открыть**.
2. Или: **Системные настройки** → **Защита и безопасность** → **Всё равно открыть**.

## Catalina (10.15)

- Скачивайте только **macOS (Intel)** — файл `Magnific.QA.Desktop.Agent-1.0.0-mac-x64.zip`.
- Нужен установленный **Google Chrome**.
- После Catalina 10.15 официально поддерживается; при сбоях рекомендуем **macOS 11+**.

## Проверка

1. Иконка агента в **меню-баре** (трей).
2. https://qa.piemnaya.ru → **Desktop Agent: Connected**.
3. http://127.0.0.1:43127/health → `"status":"ok"`.
