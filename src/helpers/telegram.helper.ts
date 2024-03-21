import TelegramBot from 'node-telegram-bot-api'
import { logger } from './logger.helper'
import { ChatData } from '../interfaces/telegram'
import { TelegramClient } from '../adapter/telegram/adapter'
import { openAiClient } from './open-ai.helper'
import { generateInstructions } from '../adapter/openai/instructions'

// TELEGRAM
const botToken = process.env.TELEGRAM_BOT_TOKEN
// OPENAI
const apiKey = process.env.OPEN_AI_KEY
const instructions = generateInstructions()
export const telegramClient = new TelegramClient(botToken, apiKey, instructions)

export const handleTelegramMessage = async (message: TelegramBot.Message) => {
    const chatId = message?.chat.id
    const chatType = message?.chat.type
    const userId = message?.from?.id
    const userFirstName = message?.from?.first_name

    // const textMessage = message?.text
    // const videoMessage = message?.video

    logger.log('info', message)

    // call openAI
    const response =
        (await openAiClient.runPrompt(message?.text || '', {
            chatId,
            chatType,
            userId,
            userFirstName,
        } as ChatData)) || 'No response from assistant, sorry.'
    logger.log('info', response)

    // call Telegram
    await telegramClient.sendMessage(response, chatId || 0)
}
