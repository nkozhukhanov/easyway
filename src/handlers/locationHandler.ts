import { Context } from 'telegraf';
import { OpenAIService } from '../services/openai';
import { Location } from '../types';

export class LocationHandler {
  constructor(private openaiService: OpenAIService) {}

  async handle(ctx: Context): Promise<void> {
    try {
      if (!ctx.message || !('location' in ctx.message)) {
        await ctx.reply('Не удалось получить данные о местоположении.');
        return;
      }

      const location: Location = ctx.message.location;
      
      // Отправляем сообщение о том, что ищем факт
      const statusMessage = await ctx.reply('🔍 Ищу интересный факт о вашем местоположении...');

      // Получаем факт от OpenAI
      const factResponse = await this.openaiService.getFact({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 500,
      });

      // Удаляем сообщение о статусе
      try {
        await ctx.deleteMessage(statusMessage.message_id);
      } catch {
        // Игнорируем ошибку удаления сообщения
      }

      if (factResponse.success) {
        // Отправляем найденный факт
        await ctx.reply(
          `📍 *Интересный факт о вашем местоположении:*\n\n${factResponse.fact}`,
          { parse_mode: 'Markdown' }
        );
      } else {
        // Отправляем сообщение об ошибке
        await ctx.reply(
          '🤷‍♂️ Не получилось найти что-то интересное, попробуйте ещё раз с другим местоположением.'
        );
        
        if (factResponse.error) {
          console.error('Ошибка получения факта:', factResponse.error);
        }
      }
    } catch (error) {
      console.error('Ошибка в LocationHandler:', error);
      await ctx.reply(
        '❌ Произошла ошибка при обработке вашего местоположения. Попробуйте ещё раз.'
      );
    }
  }
} 