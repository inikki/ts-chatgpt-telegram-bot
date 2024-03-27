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

    const message_id = await telegramClient.sendMessage('...', chatId)

    // call openAI
    const stringStream =
        (await openAiClient.runPrompt(message?.text || 'Recieved empty text', {
            chatId,
            chatType,
            userId,
            userFirstName,
        } as ChatData)) ?? []

    logger.log('info', stringStream)

    for await (const chunk of stringStream) {
        // call Telegram
        console.log('???chunk string in TELEGRAM', chunk)
        if (chunk) {
            await telegramClient.updateMessage(chunk, chatId, message_id)
        }
    }
}
