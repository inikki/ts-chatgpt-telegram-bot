import { OpenAI } from 'openai'
import { logger } from '../../helpers/logger.helper'
import type {
    ChatCompletionAssistantMessageParam,
    ChatCompletionMessageParam,
    ChatCompletionUserMessageParam,
} from 'openai/resources'
import {
    changeMood,
    getChatGptModel,
    getUsagePerSpecificDate,
    setChatGptModel,
} from './helpers/functions'
import { ChatData } from '../../interfaces/telegram'
import { RedisClientAdapter } from '../redis/adapter'
import { tools } from './helpers/tools'
import { defaultMood, generateInstructions } from './instructions'

export class OpenAiClient {
    private openAi: OpenAI
    private redisClient: RedisClientAdapter

    constructor(
        public apiKey: string,
        public instructions: string
    ) {
        this.openAi = new OpenAI({ apiKey: this.apiKey })
        this.redisClient = new RedisClientAdapter()
    }

    async runPrompt(prompt: string, chatData: ChatData) {
        try {
            const { chatId } = chatData
            const currentMood =
                (await this.redisClient.get(`channel:${chatId}`)) ?? defaultMood
            const currentChatGptModel =
                (await this.redisClient.get(`model:${chatId}`)) ??
                'gpt-3.5-turbo'

            const currentMessages = await this.preparePreviousContext(
                chatId.toString(),
                currentMood
            )

            // Stores the new message
            currentMessages.push({ role: 'user', content: prompt })

            logger.log('info', {
                name: 'openAiClient.createCompletions.input',
                currentMessages,
            })

            const result = await this.openAi.chat.completions.create({
                model: currentChatGptModel,
                temperature: 0.7,
                messages: currentMessages,
                tools,
                tool_choice: 'auto',
            })

            logger.log('info', { name: 'createCompletions.result', result })

            const responseText = result.choices[0].message.content
            const responseMessage = result.choices[0].message
            const toolCalls = responseMessage.tool_calls

            if (toolCalls && (responseText === '' || responseText === null)) {
                logger.log('info', {
                    name: 'openAiClient.toolCalls.message',
                    message: responseMessage,
                })
                const availableFunctions = {
                    getUsagePerSpecificDate,
                    changeMood: changeMood(this.redisClient, chatId),
                    setChatGptModel: setChatGptModel(this.redisClient, chatId),
                    getChatGptModel: getChatGptModel(this.redisClient, chatId),
                }

                // extend conversation with assistant's reply
                currentMessages.push({
                    role: 'assistant',
                    content: responseMessage.content,
                    tool_calls: toolCalls,
                })

                for (const toolCall of toolCalls) {
                    const functionName = toolCall.function.name
                    const functionToCall = availableFunctions[functionName]
                    const functionArgs = JSON.parse(toolCall.function.arguments)
                    const functionResponse: string =
                        await functionToCall(functionArgs)

                    console.log('???functionResponse', functionResponse)
                    console.log('???functionArgs', functionArgs)
                    console.log('???functionToCall', functionToCall)

                    logger.log('info', {
                        name: 'openAiClient.functionCallName.choice',
                        functionName,
                        functionResponse,
                        functionArgs,
                        functionToCall,
                    })

                    currentMessages.push({
                        tool_call_id: toolCall.id,
                        role: 'tool',
                        content: functionResponse,
                    })
                }

                const secondResponse =
                    await this.openAi.chat.completions.create({
                        model: currentChatGptModel,
                        temperature: 0.7,
                        messages: currentMessages,
                    })

                const secondResponseText =
                    secondResponse.choices[0].message.content

                // save prompt and response
                await this.redisClient.listPush(chatId.toString(), [
                    `user:${prompt}`,
                    `assistant:${secondResponseText}`,
                ])

                logger.log('info', {
                    name: 'openAiClient.toolChoice.output',
                    response: [prompt, secondResponseText],
                })

                return secondResponse.choices[0].message.content
            }

            // save prompt and response
            await this.redisClient.listPush(chatId.toString(), [
                `user:${prompt}`,
                `assistant:${responseText}`,
            ])

            logger.log('info', {
                name: 'openAiClient.output',
                response: [prompt, responseText],
            })

            return responseText
        } catch (error) {
            logger.info('error', error)
            const errorResponse = await this.openAi.chat.completions.create({
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                messages: [{ role: 'system', content: JSON.stringify(error) }],
            })
            return errorResponse.choices[0].message.content
        }
    }

    private async preparePreviousContext(
        chatId: string,
        currentMood: string
    ): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]> {
        // Prepare initial system message with instructions
        const currentMessages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: generateInstructions(currentMood),
            },
        ]

        // Get the previous context from redis cache
        const conversationContext = await this.redisClient.listGet(
            chatId.toString()
        )
        conversationContext.reverse()

        logger.log('info', {
            name: 'openAiClient.redis.output',
            conversationContextFromRedis: conversationContext,
        })

        // Restore the previous context
        for (const context of conversationContext) {
            const role = context.slice(0, context.indexOf(':')) as
                | ChatCompletionUserMessageParam['role']
                | ChatCompletionAssistantMessageParam['role']

            const conversation = context.slice(context.lastIndexOf(':') + 1)

            currentMessages.push({ role, content: conversation })
        }

        return currentMessages
    }

    private async handleToolCalls() {}
}
