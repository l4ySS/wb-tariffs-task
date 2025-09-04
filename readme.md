# Тестовое задание

## Описание
- Получение тарифов коробов из API Wildberries.
- Сохранение данных в PostgreSQL:
  - Ежечасное обновление текущего дня.
  - Хранение всех данных для каждого дня.
- Выгрузка данных в Google Sheets:
  - Можно работать с произвольным количеством таблиц (`N`).
  - Данные сортируются по возрастанию коэффициентов.
  - Обновление выполняется регулярно каждый час.
- Cron-демон для автоматического обновления данных.

## Настройка окружения

Для работы приложения необходимо создать .env файл по примеру example.env и ввести в него WB Токен и google credentials в base64.
```dotenv
NODE_ENV=development
APP_PORT=3000

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=wb_tariffs
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

WB_JWT_TOKEN=<ваш токен Wildberries>
GOOGLE_CREDENTIALS_BASE64=<ваш credentials.json в base64>
```

GOOGLE_CREDENTIALS_BASE64 — это credentials.json для Google Sheets, закодированный в base64, чтобы не хранить открытые ключи в репозитории.

## Запуск
Перед запуском приложения необходимо запустить базу данных:
```bash
docker compose up -d --build postgres
```

Далее можно запустить приложение:
```bash
docker compose up -d --build app
```
Финальная проверка:
```bash
docker compose down --rmi local --volumes
docker compose up --build
```
## Разработка
Запустить сервис в режиме разработки:
```bash
npm run dev
```
## Примечания

- Для хранения данных в Postgres создаются две таблицы с датами действия тарифа и тарифами для каждого склада

- Из Postgres данные публикуются и регулярно обновляются в таблице https://docs.google.com/spreadsheets/d/1Hhie7Uh_jeaBz41EkSTxe6XdT1iQQLg6WRp6L0r1Hw8/edit?gid=0#gid=0
