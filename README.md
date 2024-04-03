# TS ChatGPT Telegram Bot

This repository contains the source code for a Telegram bot powered by ChatGPT. It's seamlessly integrated with `OpenAI Streams`, compatible with `tool choices`, allowing users to interact with an AI-powered chatbot directly from their Telegram app.

## Prerequisites

Before running the bot, make sure you have the following installed:

1. Docker
2. Node.js (v21)

## Prerequisites

Clone the repository:

```ts
git clone https://github.com/inikki/ts-chatgpt-telegram-bot.git
cd ts-chatgpt-telegram-bot
npm install
```

Copy env example file. We will update envs with your variables:

```
cp .env.example .env
```

## Running only bot with CLI app

```ts
make local
```

## OPEN AI

1. Register https://platform.openai.com/
2. Create new secret key in API keys section and store in .env here `OPEN_AI_KEY`
3. You will need some credits in your account.

## Create Telegram Bot

1. Download and open your Telegram application on your mobile device or desktop. Search for @BotFather in the Telegram search bar.
2. Click on the BotFather account and click the "Start" button to begin the conversation.
3. In the chat with BotFather, type or click on /newbot and hit Send.
4. Fllow Instructions. You will be prompted to provide a name for your bot.
5. Once you've successfully created the bot, you will receive a message with bot token. We will use this token to access the HTTP API. Keep your token secure and store it safely, it can be used by anyone to control your bot.
6. Copy your token to `TELEGRAM_BOT_TOKEN`

## Running the telegram bot locally

We have 2 option how to connect telegram now. We can use webhooks or long polling (but not both):

### Long Polling

Set env variable `LONG_POLLING_FLAG=true` (default).
This will start bot and poll messages.

```ts
docker-compose up
```

or when you also need to rebuild image:

```ts
make start
```

To check messages, you can run `make getUpdates`

### Webhook

1. You will need domain or a public url with SSL certificate. Save it in env `SSL_URL`
2. Create secret token to secure communication `TELEGRAM_SECRET_TOKEN`. Only characters A-Z, a-z, 0-9, \_ and - are allowed.
3. run `make set-webhook`
4. Make sure, variable `LONG_POLLING_FLAG` is not defined.

```ts
docker-compose up
```

or when you need to rebuild image:

```ts
make start
```

Send message with curl (or postman) if you don't have app deployed:

```example curl
curl --location 'http://localhost:7999/telegram-webhook' \
--header 'x-telegram-bot-api-secret-token: your-secret-token' \
--header 'Content-Type: application/json' \
--data '{
  "message": {
    "chat": {
      "first_name": "Nikoleta",
      "id": your-chat-id,
      "type": "private"
    },
    "date": 1710178201,
    "entities": [
      {
        "length": 6,
        "offset": 0,
        "type": "bot_command"
      }
    ],
    "from": {
      "first_name": "Nikoleta",
      "id": your-chat-id,
      "is_bot": false,
      "language_code": "en"
    },
    "message_id": 440,
    "text": "Hi, this is my test question."
  },
  "update_id": 902460408
}'
```

## Running the telegram on Kubernetes

```ts
cd infra
pullumi up
```

## Remove the telegram from Kubernetes

```ts
pullumi destroy
```
