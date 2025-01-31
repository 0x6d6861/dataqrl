import { File as MongoFile } from '@/models/file';
import { getRedisClient } from '@/utils/redis';
import Redis from "ioredis";
import mongoose from 'mongoose';

const CACHE_EXPIRATION = 3600; // 1 hour
const CACHE_KEY_PREFIX = 'files:';

class FilesRepository {
	redis: Redis;

	constructor() {
		this.redis = getRedisClient()
	}

    private getCacheKey(id: string) {
        return `${CACHE_KEY_PREFIX}${id}`;
    }

    async getById(id: string) {
        const cached = await this.redis.get(this.getCacheKey(id));
        if (cached) return JSON.parse(cached);

        const file = await MongoFile.findById(id);
        if (!file) throw new Error('File not found');

		await this.redis.setex(this.getCacheKey(id), CACHE_EXPIRATION, JSON.stringify(file));
        return file;
    }

    async create(data: Partial<typeof MongoFile>) {
        const file = await MongoFile.create(data);
		await this.redis.setex(this.getCacheKey(file.id), CACHE_EXPIRATION, JSON.stringify(file));
        return file;
    }

    async update(id: string, data: Partial<typeof MongoFile>) {
        const file = await MongoFile.findByIdAndUpdate(id, data, { new: true });
        if (!file) throw new Error('File not found');

		await this.redis.setex(this.getCacheKey(id), CACHE_EXPIRATION, JSON.stringify(file));
        return file;
    }

    async delete(id: string) {
        const file = await MongoFile.findByIdAndDelete(id);
        if (!file) throw new Error('File not found');

		await this.redis.del(this.getCacheKey(id));
        return file;
    }

    async findAll(query: {
        [key: string]: any;
    }, page: number, limit: number) {
        const cacheKey = `${CACHE_KEY_PREFIX}list:${JSON.stringify(query)}:${page}:${limit}`;

		const cached = await this.redis.get(cacheKey);
        if (cached) return JSON.parse(cached);

        const skip = (page - 1) * limit;

        const files = await MongoFile.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('originalName status createdAt size');

        const total = await MongoFile.countDocuments(query);

        const result = { files, total };

		await this.redis.setex(cacheKey, CACHE_EXPIRATION, JSON.stringify(result));
        return result;
    }


	async searchFileData(fileId: string, searchParams: {
		query?: { [key: string]: any },
		sort?: { [key: string]: 1 | -1 }
	}, page: number = 1, limit: number = 10) {
		const cacheKey = `${CACHE_KEY_PREFIX}${fileId}:data:${JSON.stringify(searchParams)}:${page}:${limit}`;

		const cached = await this.redis.get(cacheKey);
		if (cached) return JSON.parse(cached);

		const skip = (page - 1) * limit;

		const pipeline: mongoose.PipelineStage[] = [
			{ $match: { _id: new mongoose.Types.ObjectId(fileId) } },
			{ $unwind: "$processedData.data" },
			{
				$match: searchParams.query ? {
					$and: Object.entries(searchParams.query).map(([key, value]) => ({
                        [`processedData.data.${key}`]: typeof value === 'number'
                            ? value
                            : { $regex: value, $options: "i" }
                    }))
				} : {}
			},
			{
				$facet: {
					data: [
						{ $skip: skip },
						{ $limit: limit },
						{
							$project: {
								data: "$processedData.data",
								_id: 0
							}
						}
					],
					total: [
						{ $count: "count" }
					],
					schema: [
						{
							$limit: 1
						},
						{
							$project: {
								schema: "$processedData.schema",
								_id: 0
							}
						}
					]
				}
			}
		];

		if (searchParams.sort) {
			pipeline.splice(3, 0, {
				$sort: Object.fromEntries(
					Object.entries(searchParams.sort).map(([key, value]) =>
						[`processedData.data.${key}`, value]
					)
				)
			});
		}

		const [result] = await MongoFile.aggregate(pipeline);

		const formattedResult = {
			data: result.data.map(item => item.data),
			total: result.total[0]?.count || 0,
			page,
			limit,
			schema: result.schema[0]?.schema
		};

		await this.redis.setex(cacheKey, CACHE_EXPIRATION, JSON.stringify(formattedResult));
		return formattedResult;
	}

}

export const filesRepository = new FilesRepository();
