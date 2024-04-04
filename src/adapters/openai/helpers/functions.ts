import { getData } from '../../../helpers/axios.helper';
import { logger } from '../../../helpers/logger.helper';
import { RedisClientAdapter } from '../../redis/adapter';

export const getUsagePerSpecificDate = async ({
  usageDate,
}: {
  usageDate: string;
}): Promise<string> => {
  logger.log('info', {
    name: 'functions.getUsagePerSpecificDate',
    date: usageDate,
  });

  const token = process.env.OPEN_AI_KEY;
  const url = `https://api.openai.com/v1/usage?date=${usageDate}`;

  logger.log('info', { name: 'functions.getUsagePerSpecificDate.url', url });
  const usage: Record<string, unknown> = await getData(url, token);
  return `Usage is sum of all "n_generated_tokens_total" in ${JSON.stringify(usage)}. Answer in your mood.`;
};

export const changeBotMood =
  (redisClient: RedisClientAdapter, chatId: number) =>
  async ({ mood }: { mood: string }): Promise<string> => {
    logger.log('info', {
      name: 'openAi.functions.changeBotMood',
      mood,
      chatId,
    });
    await redisClient.set(`channel:${chatId}`, mood);

    return `Your mood is changed to ${mood}`;
  };

enum SupportedModels {
  chatGpt3 = 'gpt-3.5-turbo',
  chatGpt4 = 'gpt-4',
}

export const setChatGptModel =
  (redisClient: RedisClientAdapter, chatId: number) =>
  async ({ chatGptModelType }: { chatGptModelType: SupportedModels }): Promise<string> => {
    logger.log('info', {
      name: 'openAi.functions.setChatGptModel',
      chatGptModelType,
    });
    try {
      await redisClient.set(`model:${chatId}`, chatGptModelType);

      return 'Return answer about changed model but tell user to keep watching on token usage as ChatGPT 4 is costly.';
    } catch (error) {
      return 'Return answer that changing chatGpt model was not possible, indicating an issue, or the user requested an unsupported model. Supported models include gpt-3.5-turbo and gpt-4.';
    }
  };

export const getChatGptModel = (redisClient: RedisClientAdapter, chatId: number) => async () => {
  logger.log('info', {
    name: 'openAi.functions.getChatGptModel',
  });

  await redisClient.get(`model:${chatId}`);

  return 'Return the current ChatGPT model as the response.';
};
