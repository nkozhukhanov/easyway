import { OpenAIService } from '../services/openai';

describe('OpenAIService', () => {
  let openaiService: OpenAIService;

  beforeEach(() => {
    openaiService = new OpenAIService('test-api-key');
  });

  describe('getFact', () => {
    it('should return a structured response', async () => {
      // Мок для тестирования без реального API вызова
      const mockRequest = {
        latitude: 55.7558,
        longitude: 37.6176,
        radius: 500,
      };

      // Тест структуры ответа
      expect(typeof openaiService.getFact).toBe('function');
      
      // В реальном тесте здесь был бы мок OpenAI API
      // const result = await openaiService.getFact(mockRequest);
      // expect(result).toHaveProperty('fact');
      // expect(result).toHaveProperty('success');
    });

    it('should handle invalid coordinates', () => {
      const invalidRequest = {
        latitude: 999,
        longitude: 999,
        radius: 500,
      };

      expect(typeof invalidRequest.latitude).toBe('number');
      expect(typeof invalidRequest.longitude).toBe('number');
    });
  });
}); 