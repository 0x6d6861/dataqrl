import { config } from "@/config/index";
import Redis from "ioredis";
import { logger } from "./logger";

const redis = new Redis(config.redis.url as string);

redis.on('ready', () => {
	logger.info('Redis is ready');
})

export const getRedisClient = () => redis;
