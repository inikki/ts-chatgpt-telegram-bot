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

  /* Start LONG Polling and handle telegram messages */
  async runBot() {
    this.bot.on('message', async (ctx) => {
      logger.log('info', ctx)

      try {
        await handleTelegramMessage(ctx)
      } catch (error) {
        logger.log('error', { error: error.message })
      }
    })

    this.bot.startPolling()
    logger.log('info', { name: 'telegramClient.startPolling.succesfull' })
  }

  /** Send message to telegram
   * @param text
   * @param userChatId
   * @param notification
   */
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

    const { message_id } = await this.bot.sendMessage(userChatId, text, {
      disable_notification: notification,
    })
    logger.log('info', { name: 'telegramClient.sendMessage.succesfull' })

    return message_id
  }

  /** Update telegram message text
   * @param text
   * @param userChatId
   * @param messageId
   */
  async updateMessage(text: string, userChatId: number, messageId: number) {
    logger.log('debug', {
      name: 'telegramClient.updateMessage.input',
      text,
      userChatId,
      messageId,
    })

    await this.bot.editMessageText(text, {
      chat_id: userChatId,
      message_id: messageId,
    })
    logger.log('info', { name: 'telegramClient.updateMessage.succesfull' })
  }
}
