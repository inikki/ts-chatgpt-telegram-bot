import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import { logger } from '../../helpers/logger.helper';
import config from '../../env';

export class RedisClientAdapter {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      socket: {
        host: config.REDIS_HOST || '127.0.0.1',
        port: parseInt(config.REDIS_PORT || '6379', 10),
      },
    });

    this.client
      .on('error', (err) => {
        logger.log('error', {
          name: 'redisClientAdapter.client.error',
          err,
        });
      })
      .connect();
  }

  async set(key: string, value: string) {
    const response = await this.client.set(key, value);
    logger.log('info', { response });
  }

  async get(key: string) {
    const value = await this.client.get(key);
    logger.log('info', { value });
    return value;
  }

  async listPush(key: string, list: string[]) {
    const response = await this.client.lPush(key, list);

    // keep conversational context simple, if more than 40, trim
    if (response > 40) {
      logger.log('info', 'trim');
      this.client.lTrim(key, 0, 39);
    }
    logger.log('info', { name: 'redisClientAdapter.listPush', response });
    return response;
  }

  async listGet(key: string) {
    const response = await this.client.lRange(key, 0, -1);

    logger.log('info', { name: 'redisClientAdapter.lRange', response });
    return response;
  }

  async onApplicationShutdown() {
    this.client.disconnect();
    logger.log('info', 'redisClientAdapter.disconnected');
  }
}
