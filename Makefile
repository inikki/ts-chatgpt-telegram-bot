include .env
export
get-updates:
	curl 'https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates'
push:
	docker build -t registry.digitalocean.com/demo-container-registry/telegram-express-app .
	docker push registry.digitalocean.com/demo-container-registry/telegram-express-app:openai
	kubectl rollout restart deployment/telegram-express-app
set-webhook:
	curl 'https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${URL}&secret_token=${TELEGRAM_SECRET_TOKEN}'
get-webhook-info:
	curl 'https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo'