# Используем официальный образ Node.js 20 LTS на базе Alpine для минимального размера
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы конфигурации зависимостей
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY src/ ./src/

# Компилируем TypeScript в JavaScript
RUN npm run build

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Меняем владельца файлов
RUN chown -R nextjs:nodejs /app
USER nextjs

# Открываем порт (Railway автоматически определит PORT)
EXPOSE 3000

# Указываем команду запуска
CMD ["npm", "start"] 