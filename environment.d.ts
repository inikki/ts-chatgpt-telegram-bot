declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'dev' | 'local'

            OPEN_AI_KEY: string

            REDIS_HOST: string
            REDIS_PORT: string

            TELEGRAM_BOT_TOKEN: string
            TELEGRAM_SECRET_TOKEN: string
        }
    }
}

export {}
