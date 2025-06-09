import { Context } from 'telegraf';
import { OpenAIService } from '../services/openai';
import { LiveLocationSession } from '../types';

export class LiveLocationScheduler {
  private activeSessions = new Map<number, LiveLocationSession>();
  private readonly INTERVAL_MINUTES = 10;

  constructor(private openaiService: OpenAIService) {}

  startSession(session: LiveLocationSession, ctx: Context): void {
    const { chatId } = session;
    
    // Останавливаем существующую сессию, если есть
    this.stopSession(chatId);

    // Устанавливаем интервал на 10 минут
    const intervalId = setInterval(async () => {
      try {
        await this.sendScheduledFact(session, ctx);
      } catch (error) {
        console.error(`Ошибка отправки факта для чата ${chatId}:`, error);
      }
    }, this.INTERVAL_MINUTES * 60 * 1000);

    // Сохраняем сессию с intervalId
    const sessionWithInterval: LiveLocationSession = {
      ...session,
      intervalId,
    };

    this.activeSessions.set(chatId, sessionWithInterval);
    
    console.log(`Live-сессия запущена для чата ${chatId}, интервал: ${this.INTERVAL_MINUTES} мин`);

    // Устанавливаем таймер для автоматического завершения сессии
    if (session.endTime) {
      const timeUntilEnd = session.endTime.getTime() - Date.now();
      if (timeUntilEnd > 0) {
        setTimeout(() => {
          this.stopSession(chatId);
          ctx.reply('⏰ Live-локация автоматически завершена.').catch(console.error);
        }, timeUntilEnd);
      }
    }
  }

  stopSession(chatId: number): void {
    const session = this.activeSessions.get(chatId);
    
    if (session?.intervalId) {
      clearInterval(session.intervalId);
      console.log(`Live-сессия остановлена для чата ${chatId}`);
    }
    
    this.activeSessions.delete(chatId);
  }

  stopAllSessions(): void {
    console.log(`Остановка всех live-сессий (${this.activeSessions.size})`);
    
    for (const [chatId] of this.activeSessions) {
      this.stopSession(chatId);
    }
  }

  private async sendScheduledFact(session: LiveLocationSession, ctx: Context): Promise<void> {
    const { chatId, location, lastFact } = session;
    
    // Проверяем, не истекло ли время сессии
    if (session.endTime && new Date() > session.endTime) {
      this.stopSession(chatId);
      await ctx.reply('⏰ Live-локация завершена.');
      return;
    }

    try {
      // Получаем новый факт
      const factResponse = await this.openaiService.getFact({
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 500,
      });

      if (factResponse.success) {
        // Проверяем, что факт не повторяется
        if (factResponse.fact === lastFact) {
          console.log(`Получен повторяющийся факт для чата ${chatId}, запрашиваем новый...`);
          
          // Пробуем получить другой факт с увеличенным радиусом
          const retryResponse = await this.openaiService.getFact({
            latitude: location.latitude,
            longitude: location.longitude,
            radius: 1000,
          });

          if (retryResponse.success && retryResponse.fact !== lastFact) {
            await this.sendFactMessage(ctx, retryResponse.fact);
            this.updateLastFact(chatId, retryResponse.fact);
          } else {
            console.log(`Не удалось получить уникальный факт для чата ${chatId}`);
          }
        } else {
          await this.sendFactMessage(ctx, factResponse.fact);
          this.updateLastFact(chatId, factResponse.fact);
        }
      } else {
        console.error(`Ошибка получения факта для чата ${chatId}:`, factResponse.error);
      }
    } catch (error) {
      console.error(`Критическая ошибка отправки факта для чата ${chatId}:`, error);
    }
  }

  private async sendFactMessage(ctx: Context, fact: string): Promise<void> {
    await ctx.reply(
      `📍 *Новый факт о вашем местоположении:*\n\n${fact}`,
      { parse_mode: 'Markdown' }
    );
  }

  private updateLastFact(chatId: number, fact: string): void {
    const session = this.activeSessions.get(chatId);
    if (session) {
      session.lastFact = fact;
      this.activeSessions.set(chatId, session);
    }
  }

  // Получить информацию об активных сессиях (для отладки)
  getActiveSessionsInfo(): Array<{ chatId: number; startTime: Date; endTime: Date | undefined }> {
    return Array.from(this.activeSessions.values()).map(session => ({
      chatId: session.chatId,
      startTime: session.startTime,
      endTime: session.endTime,
    }));
  }
} 