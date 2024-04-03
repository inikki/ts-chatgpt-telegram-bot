import { OpenAI, toFile } from 'openai';
import type {
  ChatCompletionAssistantMessageParam,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionUserMessageParam,
} from 'openai/resources';
import { Stream } from 'openai/streaming';
import { logger } from '../../helpers/logger.helper';
import { ChatData } from '../../interfaces/telegram';
import { RedisClientAdapter } from '../redis/adapter';
import {
  changeBotMood,
  getChatGptModel,
  getUsagePerSpecificDate,
  setChatGptModel,
} from './helpers/functions';
import { tools } from './helpers/tools';
import { defaultMood, generateInstructions } from './instructions';
import { Readable } from 'stream';

export class OpenAiClient {
  private openAi: OpenAI;
  private redisClient: RedisClientAdapter;

  constructor(
    public apiKey: string,
    public instructions: string,
  ) {
    this.openAi = new OpenAI({ apiKey: this.apiKey });
    this.redisClient = new RedisClientAdapter();
  }

  async runPrompt(prompt: string, chatData: ChatData) {
    try {
      logger.log('info', { name: 'openAi.runPrompt.input', prompt });
      const { chatId } = chatData;
      const currentMood = (await this.redisClient.get(`channel:${chatId}`)) ?? defaultMood;
      const currentChatGptModel =
        (await this.redisClient.get(`model:${chatId}`)) ?? 'gpt-3.5-turbo';

      // Get the previous conversional context from redis cache
      const currentMessages = await this.preparePreviousContext(chatId.toString(), currentMood);

      // Stores the new message
      currentMessages.push({ role: 'user', content: prompt });

      logger.log('info', {
        name: 'openAiClient.createCompletions.input',
        currentMessages,
      });

      const resultStream = await this.openAi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: currentMessages,
        stream: true,
        tools,
        tool_choice: 'auto',
      });

      logger.log('info', {
        name: 'createCompletions.result',
        resultStream,
      });

      const responseText = await this.processStream(
        resultStream,
        prompt,
        chatId,
        currentMessages,
        currentChatGptModel,
      );
      return responseText;
    } catch (error) {
      logger.info('error', { name: error.message });
      const errorResponse = await this.openAi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        messages: [{ role: 'system', content: JSON.stringify(error) }],
      });
      return errorResponse.choices[0].message.content;
    }
  }

  private async processStream(
    resultStream: Stream<ChatCompletionChunk>,
    prompt: string,
    chatId: number,
    currentMessages: ChatCompletionMessageParam[],
    currentChatGptModel: string,
  ) {
    const responseText: AsyncIterable<string> = async function* (this: OpenAiClient) {
      const accumulatedArguments: string[] = [];
      let accumulatedContent: string = '';
      let accumulatedToolCalls: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall[] =
        [];

      for await (const chunk of resultStream) {
        const content = chunk.choices[0].delta.content;
        if (content) {
          accumulatedContent += content;

          yield accumulatedContent;
        }

        const toolCalls = chunk.choices[0].delta.tool_calls;

        if (toolCalls) {
          const index = chunk.choices[0].delta.tool_calls?.[0].index;
          if (index === undefined) {
            throw new Error('Index is undefined');
          }

          const existingIndex = accumulatedToolCalls.findIndex(
            (toolCall) => toolCall.index === index,
          );
          if (existingIndex !== -1) {
            // If the index exists, concatenate the arguments
            accumulatedArguments[index] +=
              chunk.choices[0].delta.tool_calls?.[0].function?.arguments;

            accumulatedToolCalls = accumulatedToolCalls.map((toolCall) => {
              return {
                ...toolCall,
                function: {
                  ...toolCall.function,
                  arguments: accumulatedArguments[index],
                },
              };
            });
          } else {
            // If the index doesn't exist, push a new object with the index and arguments
            accumulatedToolCalls.push(chunk.choices[0].delta.tool_calls?.[0] ?? { index });
            accumulatedArguments[index] = '';
          }
        }
      }

      // Add response context to redis in case of response
      if (accumulatedContent) {
        // save prompt and response
        await this.redisClient.listPush(chatId.toString(), [
          `user:${prompt}`,
          `assistant:${accumulatedContent}`,
        ]);
        logger.log('info', {
          name: 'openAiClient.output',
          response: [prompt, accumulatedContent],
        });
      }

      // If toolCalls, create second response and add response context to redis
      if (accumulatedToolCalls.length > 0) {
        logger.log('info', {
          name: 'openAiClient.toolCalls.message',
          accumulatedToolCalls,
        });

        const availableFunctions = {
          getUsagePerSpecificDate,
          changeBotMood: changeBotMood(this.redisClient, chatId),
          setChatGptModel: setChatGptModel(this.redisClient, chatId),
          getChatGptModel: getChatGptModel(this.redisClient, chatId),
        };

        // Extend conversation with assistant's reply
        currentMessages.push({
          role: 'assistant',
          content: null,
          tool_calls: accumulatedToolCalls as ChatCompletionMessageToolCall[],
        });

        // add function response to context
        await this.redisClient.listPush(chatId.toString(), [
          `assistant:${JSON.stringify(accumulatedToolCalls)}:toolcall`,
        ]);

        for (const toolCall of accumulatedToolCalls) {
          const functionName = toolCall.function?.name || '';
          const functionToCall = availableFunctions[functionName];
          const functionArgs = JSON.parse(toolCall.function?.arguments || '');
          const functionResponse: string = await functionToCall(functionArgs);

          logger.log('info', {
            name: 'openAiClient.functionCallName.choice',
            functionName,
            functionResponse,
            functionArgs,
            functionToCall,
          });

          currentMessages.push({
            role: 'tool',
            tool_call_id: toolCall.id ?? '',
            content: functionResponse,
          });
        }

        const secondResponseStream = await this.openAi.chat.completions.create({
          model: currentChatGptModel,
          temperature: 0.7,
          messages: currentMessages,
          stream: true,
        });

        let secondAccumulatedContent = '';
        for await (const chunk of secondResponseStream) {
          const content = chunk.choices[0].delta.content;
          if (content) {
            secondAccumulatedContent += content;
            yield secondAccumulatedContent;
          }
        }

        // Save prompt and response
        await this.redisClient.listPush(chatId.toString(), [
          `user:${prompt}`,
          `assistant:${secondAccumulatedContent}`,
        ]);

        logger.log('info', {
          name: 'openAiClient.toolChoice.output',
          response: [prompt, secondAccumulatedContent],
        });
      }
    }.call(this);

    return responseText;
  }

  private async preparePreviousContext(
    chatId: string,
    currentMood: string,
  ): Promise<OpenAI.Chat.Completions.ChatCompletionMessageParam[]> {
    // Prepare initial system message with instructions
    const currentMessages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: generateInstructions(currentMood),
      },
    ];

    // Get the previous context from redis cache
    const conversationContext = await this.redisClient.listGet(chatId.toString());
    conversationContext.reverse();

    logger.log('info', {
      name: 'openAiClient.redis.output',
      conversationContextFromRedis: conversationContext,
    });

    // Restore the previous context
    for (const context of conversationContext) {
      const role = context.slice(0, context.indexOf(':')) as
        | ChatCompletionUserMessageParam['role']
        | ChatCompletionAssistantMessageParam['role'];

      const conversation = context.slice(context.lastIndexOf(':') + 1);
      const isToolCalls = context.slice(context.lastIndexOf(':') + 2);

      if (isToolCalls === 'toolcall') {
        currentMessages.push({
          role: 'assistant',
          tool_calls: JSON.parse(conversation),
          content: null,
        });
      } else {
        currentMessages.push({ role, content: conversation });
      }
    }

    return currentMessages;
  }

  async audioToText(audio: Buffer, fileName?: string) {
    const convertedFile = await toFile(Readable.from(audio), fileName);

    const transcription = await this.openAi.audio.transcriptions.create({
      file: convertedFile,
      model: 'whisper-1',
    });

    return transcription.text;
  }

  async textToAudio(text: string) {
    const speech = await this.openAi.audio.speech.create({
      input: text,
      model: 'tts-1',
      voice: 'nova',
    });
    const audioArrayBuffer = await speech.arrayBuffer();
    const buffer = Buffer.from(audioArrayBuffer);

    return buffer;
  }
}
