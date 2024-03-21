import { OpenAiClient } from '../adapter/openai/adapter'
import { generateInstructions } from '../adapter/openai/instructions'

const apiKey = process.env.OPEN_AI_KEY
const instructions = generateInstructions()
export const openAiClient = new OpenAiClient(apiKey, instructions)
