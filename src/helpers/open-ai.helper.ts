import { OpenAiClient } from '../adapters/openai/adapter';
import { generateInstructions } from '../adapters/openai/instructions';
import config from '../env';

const apiKey = config.OPEN_AI_KEY;

const instructions = generateInstructions();
export const openAiClient = new OpenAiClient(apiKey, instructions);
