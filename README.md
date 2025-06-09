# EasyWay Telegram Bot

🤖 Telegram-бот, который предоставляет интересные факты о местах на основе геолокации пользователя, используя OpenAI GPT-4o-mini.

## ✨ Возможности

- 📍 **Одноразовая локация**: отправьте местоположение и получите интересный факт о нем
- 🔄 **Live-локация**: получайте новые факты каждые 10 минут в реальном времени
- 🎯 **Радиус поиска**: факты в радиусе 500-1000 метров от вашей позиции
- 🌍 **Любые места**: работает в любой точке мира
- 🚀 **Быстрая обработка**: факты генерируются за 3-5 секунд

## 🛠 Технологии

- **Runtime**: Node.js 20 LTS
- **Bot SDK**: Telegraf 4.18.2
- **AI**: OpenAI GPT-4o-mini
- **Language**: TypeScript
- **Deployment**: Railway + Docker
- **CI/CD**: GitHub Actions

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 20+ ([скачать](https://nodejs.org/))
- Telegram Bot Token ([получить у @BotFather](https://t.me/botfather))
- OpenAI API Key ([получить здесь](https://platform.openai.com/api-keys))

### Локальная установка

1. **Клонируйте репозиторий**
   \`\`\`bash
   git clone https://github.com/your-username/easyway-telegram-bot.git
   cd easyway-telegram-bot
   \`\`\`

2. **Установите зависимости**
   \`\`\`bash
   npm install
   \`\`\`

3. **Настройте переменные окружения**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Отредактируйте \`.env\`:
   \`\`\`env
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   NODE_ENV=development
   \`\`\`

4. **Запустите в режиме разработки**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Соберите для продакшена**
   \`\`\`bash
   npm run build
   npm start
   \`\`\`

## 📦 Деплой на Railway

### Автоматический деплой

1. **Форкните репозиторий** на GitHub

2. **Подключите к Railway**:
   - Перейдите на [railway.app](https://railway.app/)
   - Создайте новый проект из GitHub репозитория
   - Railway автоматически определит Node.js проект

3. **Настройте переменные окружения** в Railway Dashboard:
   \`\`\`
   TELEGRAM_BOT_TOKEN=your_token
   OPENAI_API_KEY=your_key
   \`\`\`

4. **Настройте GitHub Secrets** для CI/CD:
   - \`RAILWAY_TOKEN\` - ваш Railway API токен
   - \`RAILWAY_SERVICE_ID\` - ID сервиса Railway

### Ручной деплой

\`\`\`bash
# Установите Railway CLI
npm install -g @railway/cli

# Войдите в Railway
railway login

# Создайте новый проект
railway new

# Деплой
railway up
\`\`\`

## 🐳 Docker

### Локальная сборка и запуск

\`\`\`bash
# Соберите образ
docker build -t easyway-bot .

# Запустите контейнер
docker run -d \\
  --name easyway-bot \\
  -e TELEGRAM_BOT_TOKEN=your_token \\
  -e OPENAI_API_KEY=your_key \\
  -p 3000:3000 \\
  easyway-bot
\`\`\`

## 📁 Структура проекта

\`\`\`
easyway/
├── src/
│   ├── handlers/           # Обработчики сообщений
│   │   ├── locationHandler.ts
│   │   └── liveLocationHandler.ts
│   ├── services/           # Интеграции (OpenAI)
│   │   └── openai.ts
│   ├── scheduler/          # Планировщик для live-локаций
│   │   └── liveLocationScheduler.ts
│   ├── types/              # TypeScript типы
│   │   └── index.ts
│   └── index.ts            # Точка входа
├── .github/workflows/      # CI/CD
├── docs/                   # Документация
├── Dockerfile              # Docker конфигурация
├── package.json            # Зависимости
└── tsconfig.json           # TypeScript конфигурация
\`\`\`

## 🔧 Разработка

### Доступные скрипты

- \`npm run dev\` - запуск в режиме разработки
- \`npm run build\` - сборка TypeScript
- \`npm start\` - запуск продакшен версии
- \`npm run lint\` - проверка кода ESLint
- \`npm run lint:fix\` - исправление ошибок ESLint
- \`npm run format\` - форматирование кода Prettier

### Тестирование

\`\`\`bash
# Запуск тестов (когда они будут добавлены)
npm test
\`\`\`

## 📖 Использование

1. **Найдите бота** в Telegram: [@your_bot_username](https://t.me/your_bot_username)

2. **Отправьте команду** \`/start\` для начала работы

3. **Отправьте локацию**:
   - Через кнопку 📎 → Локация
   - Выберите "Отправить мою текущую локацию" для одноразового факта
   - Выберите "Поделиться live-локацией" для непрерывных обновлений

4. **Получите факт** о вашем местоположении!

## 🐛 Решение проблем

### Бот не отвечает
- Проверьте правильность \`TELEGRAM_BOT_TOKEN\`
- Убедитесь, что бот добавлен в чат и имеет права на отправку сообщений

### Ошибки OpenAI
- Проверьте правильность \`OPENAI_API_KEY\`
- Убедитесь, что у вас есть кредиты на аккаунте OpenAI
- Проверьте лимиты запросов

### Проблемы с Docker
- Убедитесь, что Docker установлен и запущен
- Проверьте, что все переменные окружения переданы корректно

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE)

## 🤝 Вклад в проект

1. Форкните проект
2. Создайте feature-ветку (\`git checkout -b feature/amazing-feature\`)
3. Закоммитьте изменения (\`git commit -m 'Add amazing feature'\`)
4. Запушьте в ветку (\`git push origin feature/amazing-feature\`)
5. Откройте Pull Request

## 🙋‍♂️ Поддержка

Если у вас есть вопросы или проблемы:

- Создайте [Issue](https://github.com/your-username/easyway-telegram-bot/issues)
- Напишите на email: your-email@example.com
- Telegram: [@your_username](https://t.me/your_username) 