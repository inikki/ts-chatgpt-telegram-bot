import { OpenAiClient } from '../adapter/openai/adapter'
import { generateInstructions } from '../adapter/openai/instructions'
import { logger } from '../helpers/logger.helper'
import { Request, Response, Router } from 'express'
import { ChatData } from '../interfaces/telegram'

const router = Router()

// OPENAI
const apiKey = process.env.OPEN_AI_KEY
const instructions = generateInstructions()
const openAiClient = new OpenAiClient(apiKey, instructions)

router.post('/chatbot', async (req: Request, res: Response) => {
    logger.log('info', { name: 'router.chatBot.input', req })

    const { text } = req.body
    const chatData: ChatData = {
        // just for test purposes
        chatId: 12345,
        userId: 56789,
        chatType: 'private',
        userFirstName: 'local',
    }
    // call openAI
    const response =
        (await openAiClient.runPrompt(text, chatData)) ||
        'No response from assistant, sorry.'
    logger.log('info', response)

    res.status(200).json({ reply: response })
    logger.log('info', { name: 'router.chatBot.ok', response })
})

export default router
