const Redis = require('ioredis');
const logger = require('./logger');

let client;

function getRedis() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null, // don't retry — fail fast
      enableOfflineQueue: false,
    });

    client.on('error', (err) => {
      if (err.code !== 'ECONNREFUSED') {
        logger.error('Redis error:', err);
      }
    });
    client.on('connect', () => logger.info('Redis connected'));
  }
  return client;
}

async function connectRedis() {
  const redis = getRedis();
  await redis.connect();
  return redis;
}

module.exports = { getRedis, connectRedis };
