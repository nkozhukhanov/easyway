import { Context } from 'telegraf';
import { OpenAIService } from '../services/openai';
import { LiveLocationScheduler } from '../scheduler/liveLocationScheduler';
import { Location } from '../types';

export class LiveLocationHandler {
  private scheduler: LiveLocationScheduler;

  constructor(private openaiService: OpenAIService) {
    this.scheduler = new LiveLocationScheduler(openaiService);
  }

  async handle(ctx: Context): Promise<void> {
    try {
      if (!ctx.editedMessage || !('location' in ctx.editedMessage)) {
        return;
      }

      const location: Location = ctx.editedMessage.location;
      const chatId = ctx.chat?.id;

      if (!chatId) {
        await ctx.reply('Не удалось определить чат.');
        return;
      }

      // Проверяем, есть ли live_period
      if (location.live_period && location.live_period > 0) {
        // Это начало или обновление live-локации
        console.log(`Получена live-локация от чата ${chatId}, период: ${location.live_period}с`);
        
        // Сразу отправляем первый факт
        const statusMessage = await ctx.reply('🔍 Ищу интересный факт о вашем текущем местоположении...');

        const factResponse = await this.openaiService.getFact({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 500,
        });

        try {
          await ctx.deleteMessage(statusMessage.message_id);
        } catch {
          // Игнорируем ошибку удаления
        }

        if (factResponse.success) {
          await ctx.reply(
            `📍 *Live-локация активна!*\n\n${factResponse.fact}\n\n🔄 _Буду присылать новые факты каждые 10 минут._`,
            { parse_mode: 'Markdown' }
          );

          // Запускаем или обновляем планировщик
          this.scheduler.startSession({
            chatId,
            location,
            lastFact: factResponse.fact,
            startTime: new Date(),
            endTime: new Date(Date.now() + location.live_period * 1000),
          }, ctx);
        } else {
          await ctx.reply(
            '🤷‍♂️ Не получилось найти что-то интересное для live-локации. Попробуйте ещё раз.'
          );
        }
      } else {
        // Это завершение live-локации
        console.log(`Завершение live-локации от чата ${chatId}`);
        this.scheduler.stopSession(chatId);
        
        await ctx.reply(
          '⏹️ Live-локация завершена. Спасибо за использование!'
        );
      }
    } catch (error) {
      console.error('Ошибка в LiveLocationHandler:', error);
      await ctx.reply(
        '❌ Произошла ошибка при обработке live-локации. Попробуйте ещё раз.'
      );
    }
  }

  // Метод для остановки всех активных сессий при завершении работы
  stopAllSessions() {
    this.scheduler.stopAllSessions();
  }
} 