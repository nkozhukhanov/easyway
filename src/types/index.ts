export interface Location {
  latitude: number;
  longitude: number;
  horizontal_accuracy?: number;
  live_period?: number;
  heading?: number;
  proximity_alert_radius?: number;
}

export interface LiveLocationSession {
  chatId: number;
  location: Location;
  lastFact?: string;
  startTime: Date;
  endTime?: Date;
  intervalId?: NodeJS.Timer;
}

export interface FactRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface FactResponse {
  fact: string;
  success: boolean;
  error?: string;
}

export interface Config {
  telegramBotToken: string;
  openaiApiKey: string;
  port: number;
  nodeEnv: string;
} 