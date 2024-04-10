# TS ChatGPT Telegram Bot

Welcome to the TS ChatGPT Telegram Bot! 🤖💬

Imagine having a friendly AI companion right in your Telegram app, ready to chat with you about anything. Have your English Teacher 👩🏽‍🏫, Rubber duck 🦆, Story Teller, Language Translator or even your personal weather forecaster ⛈️ right in your pocket!

This repository contains the source code for a Telegram bot powered by ChatGPT built with Node.js (Express.js). It's seamlessly integrated with `OpenAI Streams`, compatible with `Tool choices`, allowing users to interact with an AI-powered chatbot directly from their Telegram app. The bot supports both voice and text communication 😊✨

Additionally, context information is stored in a `Redis cache`, ensuring smooth and continuous conversations with the bot.

<img src="https://github.com/inikki/ts-chatgpt-telegram-bot/assets/16180634/84da7a8e-e27a-4959-8005-d707ae4e1b6a" width="200">
<img src="https://github.com/inikki/ts-chatgpt-telegram-bot/assets/16180634/628364a4-3643-402d-a3bb-a846a186229c" width="200">
<img src="https://github.com/inikki/ts-chatgpt-telegram-bot/assets/16180634/50052ded-cd29-431e-896f-174ff7b6a053" width="200">

## Prerequisites

Before diving in, ensure you have the following installed:

1. Docker
2. Node.js (v21) 🚀

## Getting Started

Let's get this bot up and running in no time! Here's what you need to do:

Clone the repository:

```bash
git clone https://github.com/inikki/ts-chatgpt-telegram-bot.git
cd ts-chatgpt-telegram-bot
npm install
```

Copy env example file. We will update envs with your variables:

```
cp .env.example .env
```

## OPEN AI

1. Register https://platform.openai.com/
2. Create new secret key in API keys section and store in .env here `OPEN_AI_KEY`
3. You will need some credits in your account.

## Running the bot with CLI app

Use Makefile to run:

```bash
make local
```

<img src="https://github.com/inikki/ts-chatgpt-telegram-bot/assets/16180634/9c836d7d-7561-441b-bd64-ec90164c248e" width="500">

## Create Telegram Bot

1. Download and open your Telegram application on your mobile device or desktop. Search for @BotFather in the Telegram search bar.
2. Click on the BotFather account and click the "Start" button to begin the conversation.
3. In the chat with BotFather, type or click on /newbot and hit Send.
4. Follow Instructions. You will be prompted to provide a name for your bot.
5. Once you've successfully created the bot, you will receive a message with bot token. Keep your token secure and store it safely, it can be used by anyone to control your bot.
6. Copy your token to .env `TELEGRAM_BOT_TOKEN`.

## Running the telegram bot locally

We have two options how to use telegram. We can use webhooks or long polling (but not both):

### Long Polling

Set env variable `LONG_POLLING_FLAG=true` (default).
This will start bot and poll messages.

```bash
docker-compose up
```

or when you also need to rebuild image:

```bash
docker-compose build
docker-compose up
```

To check incoming messages, you can run `make get-updates`

### Webhooks

1. You will need domain or a public url with SSL certificate. Save it in env `SSL_URL`
2. Create secret token to secure communication `TELEGRAM_WEBHOOK_SECRET_TOKEN`. Only characters A-Z, a-z, 0-9, \_ and - are allowed.
3. Run `make set-webhook`
4. Make sure, variable `LONG_POLLING_FLAG` is not defined. Remove it from .env's.

```bash
docker-compose up
```

or when you need to rebuild image:

```bash
docker-compose build
docker-compose up
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

- To keep it simple, this is only working with `long polling` option, so make sure, this .env is set. (Using webhooks requires additional configuration such as setting up an ingress controller, cert manager, and issuer.)

Setting up the bot on Kubernetes is easy! Follow these steps:

1. Create a Kubernetes Cluster:
   Set up a Kubernetes cluster, set up Containter registry.

2. Push image to your registry

```bash
docker build -t your-container-registry/telegram-express-app .
docker push your-container-registry/telegram-express-app:openai
```

3. Deploy the Bot:
   Navigate to the k8s directory, edit deployment.yaml with your image and env variables and apply the deployment configurations:

```bash
cd k8s
kubectl apply deployment.yaml
kubectl apply service.yaml
kubectl apply redis/service.yaml
kubectl apply redis/statefulSet.yaml
```

# TODO's 👩🏻‍💻

- Implement image generation feature
- Implement reaction system to identify inadequate responses 👎
- Summarize long conversations to fit within the context token limitation
- Integrate embeddings functionality
- Set up Pulumi for streamlined deployment, including teardown processes 😊
- Tiktoken
