import { OpenAiClient } from '../adapters/openai/adapter';
import { generateInstructions } from '../adapters/openai/instructions';

const apiKey = process.env.OPEN_AI_KEY;
const instructions = generateInstructions();
export const openAiClient = new OpenAiClient(apiKey, instructions);
