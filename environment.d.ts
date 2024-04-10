declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'dev' | 'local';
      LOG_LEVEL: 'info' | 'debug' | 'error';

      OPEN_AI_KEY: string;

      REDIS_HOST: string;
      REDIS_PORT: string;

      TELEGRAM_BOT_TOKEN: string;
      TELEGRAM_WEBHOOK_SECRET_TOKEN: string;
    }
  }
}

export {};
