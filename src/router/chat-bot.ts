import { logger } from '../helpers/logger.helper'
import { Request, Response, Router } from 'express'
import { ChatData } from '../interfaces/telegram'
import { openAiClient } from '../helpers/open-ai.helper'

const router = Router()

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
  const stringStream =
    (await openAiClient.runPrompt(text, chatData)) ||
    'No response from assistant, sorry.'

  let response: string = ''
  for await (const chunk of stringStream) {
    response = chunk
  }

  res.status(200).json({ reply: response })
  logger.log('info', { name: 'router.chatBot.ok', response })
})

export default router
