import TelegramBot from 'node-telegram-bot-api'
import { logger } from '../../helpers/logger.helper'
import { handleTelegramMessage } from '../../helpers/telegram.helper'

export class TelegramClient {
    private bot: TelegramBot

    constructor(
        public botToken: string,
        public apiKey: string,
        public instuctions: string
    ) {
        this.bot = new TelegramBot(this.botToken)
    }

    // Start LONG Polling and handle messages
    async runBot() {
        this.bot.on('message', async (ctx) => {
            logger.log('info', ctx)

            try {
                await handleTelegramMessage(ctx)
            } catch (error) {
                logger.log('error', error)
            }
        })

        this.bot.startPolling()
        logger.log('info', { name: 'telegramClient.startPolling.succesfull' })
    }

    async sendMessage(
        text: string,
        userChatId: number,
        notification: boolean = false
    ) {
        logger.log('info', {
            name: 'telegramClient.sendMessage.input',
            text,
            userChatId,
            notification,
        })

        await this.bot.sendMessage(userChatId, text, {
            disable_notification: notification,
        })
        logger.log('info', { name: 'telegramClient.sendMessage.succesfull' })
    }
}
