import TelegramBot from 'node-telegram-bot-api';
import { logger } from './logger.helper';
import { ChatData } from '../interfaces/telegram';
import { TelegramClient } from '../adapters/telegram/adapter';
import { openAiClient } from './open-ai.helper';
import { generateInstructions } from '../adapters/openai/instructions';
import { collectChunksForDuration, getRandomInt } from './collect-chunks.helper';
import { downloadFileToMemory } from './axios.helper';
import config from '../env';

// TELEGRAM
const botToken = config.TELEGRAM_BOT_TOKEN;
// OPENAI
const apiKey = config.OPEN_AI_KEY;
const instructions = generateInstructions();
export const telegramClient = new TelegramClient(botToken, apiKey, instructions);

export const handleTelegramMessage = async (message: TelegramBot.Message) => {
  try {
    const chatId = message?.chat.id;
    const chatType = message?.chat.type;
    const userId = message?.from?.id;
    const userFirstName = message?.from?.first_name;

    let textMessage = message?.text;
    const audioMessage = message?.voice;

    logger.log('info', message);

    const messageId = await telegramClient.sendMessage('...', chatId);

    if (audioMessage) {
      const fileId = audioMessage.file_id;
      const getFileUrl = await telegramClient.getFileLink(fileId);
      const data = await downloadFileToMemory(getFileUrl);

      textMessage = await openAiClient.audioToText(data, 'file.oga');
    }

    // call openAI
    const stringStream = await openAiClient.runPrompt(textMessage || 'Recieved empty text', {
      chatId,
      chatType,
      userId,
      userFirstName,
    } as ChatData);

    logger.log('info', stringStream);

    const durationInMs = getRandomInt(90, 150);

    const accumulatedMessage: string[] = [];
    for await (const chunk of collectChunksForDuration(stringStream, durationInMs)) {
      if (chunk && chunk !== ' ') {
        accumulatedMessage.push(chunk);
        logger.log('info', { name: 'telegramHelper.chunk', chunk });

        // call Telegram
        await telegramClient.updateMessage(chunk, chatId, messageId);
      }
    }

    if (audioMessage) {
      const testVoice = await openAiClient.textToAudio(
        accumulatedMessage[accumulatedMessage.length - 1],
      );
      // call Telegram
      await telegramClient.sendVoiceMessage(chatId.toString(), testVoice);
    }
  } catch (error) {
    logger.log('error', {
      error,
      status: error.statusCode,
      message: error.message,
    });
  }
};
