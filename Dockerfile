# Используем официальный образ Node.js 20 LTS на базе Alpine для минимального размера
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы конфигурации зависимостей
COPY package*.json ./
COPY tsconfig.json ./

# Устанавливаем все зависимости, включая dev-зависимости
RUN npm install

# Копируем исходный код
COPY src/ ./src/

# Собираем проект
RUN npm run build

# Удаляем dev-зависимости
RUN npm prune --omit=dev

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