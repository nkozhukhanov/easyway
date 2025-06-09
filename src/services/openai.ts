import OpenAI from 'openai';
import { FactRequest, FactResponse } from '../types';

export class OpenAIService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
    });
  }

  async getFact(request: FactRequest): Promise<FactResponse> {
    try {
      const { latitude, longitude, radius = 500 } = request;

      const prompt = `Найди ОДИН малоизвестный факт о месте в радиусе ${radius} метров от координат ${latitude}, ${longitude}. 
      
Требования:
- Максимум 300 символов
- На русском языке
- Без ссылок и источников
- Интересный и проверенный факт
- Если это природное место, расскажи о его особенностях
- Если это город/поселение, расскажи об истории или достопримечательности
- Если ничего интересного нет поблизости, найди что-то в более широком радиусе

Ответь только фактом, без дополнительного текста.`;

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Ты - эксперт по географии и истории, который знает интересные факты о любых местах на Земле.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const fact = completion.choices[0]?.message?.content?.trim();

      if (!fact) {
        return {
          fact: '',
          success: false,
          error: 'Не удалось получить факт от OpenAI',
        };
      }

      return {
        fact,
        success: true,
      };
    } catch (error) {
      console.error('OpenAI error:', error);
      
      let errorMessage = 'Произошла ошибка при обращении к OpenAI';
      
      if (error instanceof Error) {
        if (error.message.includes('rate limit')) {
          errorMessage = 'Превышен лимит запросов к OpenAI';
        } else if (error.message.includes('invalid')) {
          errorMessage = 'Некорректный запрос к OpenAI';
        }
      }

      return {
        fact: '',
        success: false,
        error: errorMessage,
      };
    }
  }
} 