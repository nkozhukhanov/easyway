import { Telegraf } from 'telegraf';
import { config } from 'dotenv';
import { createServer } from 'http';
import { OpenAIService } from './services/openai';
import { LocationHandler } from './handlers/locationHandler';
import { LiveLocationHandler } from './handlers/liveLocationHandler';
import { Config } from './types';

// Загружаем переменные окружения
config();

// Валидация конфигурации
function validateConfig(): Config {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const port = parseInt(process.env.PORT || '3000', 10);
  const nodeEnv = process.env.NODE_ENV || 'development';

  if (!telegramBotToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }

  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  return {
    telegramBotToken,
    openaiApiKey,
    port,
    nodeEnv,
  };
}

async function main() {
  try {
    // Валидируем конфигурацию
    const appConfig = validateConfig();
    
    console.log('🚀 Запуск EasyWay Telegram Bot...');
    console.log(`📍 Режим: ${appConfig.nodeEnv}`);
    console.log(`🔌 Порт: ${appConfig.port}`);

    // Инициализируем сервисы
    const openaiService = new OpenAIService(appConfig.openaiApiKey);
    const bot = new Telegraf(appConfig.telegramBotToken);

    // Инициализируем обработчики
    const locationHandler = new LocationHandler(openaiService);
    const liveLocationHandler = new LiveLocationHandler(openaiService);

    // Настраиваем обработчики событий
    bot.on('location', async (ctx) => {
      await locationHandler.handle(ctx);
    });

    bot.on('edited_message', async (ctx) => {
      if (ctx.editedMessage && 'location' in ctx.editedMessage) {
        await liveLocationHandler.handle(ctx);
      }
    });

    // Обработчик команды /start
    bot.start(async (ctx) => {
      await ctx.reply(
        '👋 Привет! Я EasyWay Bot.\n\n' +
        '📍 Отправь мне свое местоположение, и я расскажу интересный факт о нем!\n\n' +
        '🔄 Также поддерживается live-локация — буду присылать новые факты каждые 10 минут.\n\n' +
        '🚀 Попробуй прямо сейчас!'
      );
    });

    // Обработчик помощи
    bot.help(async (ctx) => {
      await ctx.reply(
        '❓ *Как использовать бота:*\n\n' +
        '1️⃣ Отправьте обычное местоположение — получите факт об этом месте\n' +
        '2️⃣ Отправьте live-локацию — получайте новые факты каждые 10 минут\n' +
        '3️⃣ Факты генерируются в радиусе 500 метров от вашей позиции\n\n' +
        '⚡ Бот работает на базе OpenAI GPT-4o-mini',
        { parse_mode: 'Markdown' }
      );
    });

    // Обработчик неизвестных команд
    bot.on('text', async (ctx) => {
      await ctx.reply(
        '🤔 Я понимаю только локации.\n\n' +
        'Отправьте мне свое местоположение через кнопку 📎 → Локация'
      );
    });

    // Обработка ошибок
    bot.catch((err, ctx) => {
      console.error('Ошибка бота:', err);
      if (ctx) {
        ctx.reply('❌ Произошла ошибка. Попробуйте ещё раз.').catch(() => {
          // Игнорируем ошибку отправки сообщения об ошибке
        });
      }
    });

    // Запускаем бота
    await bot.launch();
    console.log('✅ Бот успешно запущен!');

    // Создаем HTTP сервер для healthcheck (для Railway)
    const server = createServer((req, res) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(appConfig.port, () => {
      console.log(`🌐 HTTP сервер запущен на порту ${appConfig.port}`);
    });

    // Graceful shutdown
    process.once('SIGINT', () => {
      console.log('🛑 Получен сигнал SIGINT, завершаем работу...');
      bot.stop('SIGINT');
    });

    process.once('SIGTERM', () => {
      console.log('🛑 Получен сигнал SIGTERM, завершаем работу...');
      bot.stop('SIGTERM');
    });

  } catch (error) {
    console.error('❌ Ошибка запуска приложения:', error);
    process.exit(1);
  }
}

// Запускаем приложение
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Критическая ошибка:', error);
    process.exit(1);
  });
} 