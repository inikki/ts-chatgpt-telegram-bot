import { getData } from '../../../helpers/external-api.helper'
import { logger } from '../../../helpers/logger.helper'
import { RedisClientAdapter } from '../../redis/adapter'

export const getUsagePerSpecificDate = async ({
    usageDate,
}: {
    usageDate: string
}): Promise<string> => {
    logger.log('info', {
        name: 'functions.getUsagePerSpecificDate',
        date: usageDate,
    })

    const token = process.env.OPEN_AI_KEY
    const url = `https://api.openai.com/v1/usage?date=${usageDate}`

    logger.log('info', { name: 'functions.getUsagePerSpecificDate.url', url })
    const usage: Record<string, unknown> = await getData(url, token)
    return `Usage is sum of all "n_generated_tokens_total" in ${JSON.stringify(usage)}. Answer in your mood.`
}

export const changeMood =
    (redisClient: RedisClientAdapter, chatId: number) =>
    async ({ mood }: { mood: string }) => {
        logger.log('info', {
            name: 'openAi.functions.changeMood',
            mood,
            chatId,
        })
        await redisClient.set(`channel:${chatId}`, mood)

        return `Your mood is changed to ${mood}`
    }

enum SupportedModels {
    chatGpt3 = 'gpt-3.5-turbo',
    chatGpt4 = 'gpt-4',
}

export const setChatGptModel =
    (redisClient: RedisClientAdapter, chatId: number) =>
    async ({ chatGptModelType }: { chatGptModelType: SupportedModels }) => {
        logger.log('info', {
            name: 'openAi.functions.setChatGptModel',
            chatGptModelType,
        })
        try {
            await redisClient.set(`model:${chatId}`, chatGptModelType)

            return 'Return answer about changed model but tell user to keep watching on token usage as chatGpt 4 is pricey'
        } catch (error) {
            return 'Return answer that changing was not possible, something went wrong or maybe user asked for not supported model. Only supported are gpt-3.5-turbo and gpt-4'
        }
    }

export const getChatGptModel =
    (redisClient: RedisClientAdapter, chatId: number) => async () => {
        logger.log('info', {
            name: 'openAi.functions.getChatGptModel',
        })

        await redisClient.get(`model:${chatId}`)

        return 'Return actual chatgpt model as answer'
    }
