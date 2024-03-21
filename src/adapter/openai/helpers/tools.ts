import type { ChatCompletionTool } from 'openai/resources'

export const tools: ChatCompletionTool[] = [
    {
        type: 'function',
        function: {
            name: 'getUsagePerSpecificDate',
            description: 'Get token usage per specific date',
            parameters: {
                type: 'object',
                properties: {
                    usageDate: {
                        type: 'string',
                        description: 'This should be day in format YYYY-MM-DD',
                    },
                },
                required: ['usageDate'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'changeMood',
            description:
                'This should change mood of assistant, it will change instructions',
            parameters: {
                type: 'object',
                properties: {
                    mood: {
                        type: 'string',
                        description:
                            'This should be mood of assistant, e.g. funny, serious, dramatic, moody',
                    },
                },
                required: ['mood'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'setChatGptModel',
            description:
                'This will change chat gpt model to gpt-3.5-turbo or gpt-4',
            parameters: {
                type: 'object',
                properties: {
                    chatGptModelType: {
                        type: 'string',
                        description:
                            'these chatGpt models are only supported: gpt-3.5-turbo and gpt-4',
                    },
                },
                required: ['chatGptModelType'],
            },
        },
    },
    {
        type: 'function',
        function: {
            name: 'getChatGptModel',
            description:
                'This will check what chat gpt model is set in actual conversation',
            parameters: {
                type: 'object',
                properties: {
                    chatGptModelType: {
                        type: 'string',
                        description:
                            'these chatGpt models are supported: gpt-3.5-turbo and gpt-4',
                    },
                },
                required: ['chatGptModelType'],
            },
        },
    },
]
