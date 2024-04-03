import { Request, Response, Router } from 'express';
import { logger } from '../helpers/logger.helper';

import TelegramBot, { Update } from 'node-telegram-bot-api';
import { handleTelegramMessage } from '../helpers/telegram.helper';

const router: Router = Router();

const secretToken = process.env.TELEGRAM_SECRET_TOKEN;

/* Telegram webhooks, usage disabled by default*/
router.post('/telegram-webhook', async (req: Request, res: Response) => {
  const headers = req.headers;
  logger.log('info', headers);

  if (headers['x-telegram-bot-api-secret-token'] === secretToken) {
    const telegramUpdate: Update = req.body;
    const { message } = telegramUpdate;

    try {
      res.status(200).json({ status: 'ok' });

      await handleTelegramMessage(message as TelegramBot.Message);
    } catch (error) {
      logger.log('error', error);
    }
  } else {
    logger.log('error', { name: '', request: req.body });
    res.status(401).json({ status: 'unauthorized' });
  }
});

export default router;
