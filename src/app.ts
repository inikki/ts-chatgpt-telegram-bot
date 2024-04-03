import express from 'express';
import telegramWebhook from './router/telegram-webhook';
import healthCheck from './router/health-check';
import chatBot from './router/chat-bot';
import { telegramClient } from './helpers/telegram.helper';

const app = express();

// Middlewares
app.use(express.json());

app.use(chatBot);

app.use(healthCheck);

if (process.env.LONG_POLLING_FLAG) {
  await telegramClient.runBot();
} else {
  app.use(telegramWebhook);
}

export default app;
