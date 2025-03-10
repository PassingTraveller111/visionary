import Redis from "ioredis";
import redis from "@/lib/redis";
import {TableNames} from "@/app/api/sql/type";

/*
* redisKey命名规范
* 使用冒号 : 分隔不同的层次，例如 业务模块:子模块:具体标识。如 user:profile:123 表示用户 ID 为 123 的个人资料。
* */





/**
 * 用于存储用户的基本信息
 * 生命周期：用户信息更新或删除
 * @param userId
 */
 function getUserInfoKey(userId: number) {
    return `user:userInfo:${userId}`;
}

/**
* 用于存储文章数据
* 生命周期：文章数据更新或删除
* @param articleId
*/
function getArticleKey(articleId: number) {
     return `article:content:${articleId}`;
}

/**
 * 用于存储草稿数据
 * 生命周期：草稿数据更新或删除
* @param draftId
*/
function getDraftKey(draftId: number) {
    return `draft:content:${draftId}`;
}
/*
* 用于邮箱验证码发送时间的记录
* */
function getEmailTimeDownKey(email: string){
    return `email:verify:${email}`;
}

function getArticleCountByUserId(userId: number) {
    return `article:countByUserId:${userId}`;
}


export {
    getUserInfoKey,
    getArticleKey,
    getDraftKey,
    getEmailTimeDownKey,
    getArticleCountByUserId,
}

class RedisManager<Params extends Record<string, string | number>, Value> {
    // 涉及的表列表
    private readonly tables: TableNames[];
    // Redis 客户端实例
    private readonly redisClient: Redis;
    // key的前缀
    private readonly redisKeyPrefix: string;
    constructor(tables: TableNames[], redisKeyPrefix: string) {
        this.tables = tables;
        this.redisClient = redis;
        this.redisKeyPrefix = redisKeyPrefix;
        this.getRedisKey = (params) => {
            return this.redisKeyPrefix
                + ':'
                + Object.keys(params).reduce((preValue, curValue) => preValue + ':' + params[curValue]);
        }
    }
    // 获取其redis的key值
    getRedisKey: (params: Params) => string;
    getRedisValue =  async (params: Params): Promise<Value | null> => {
        try{
            const data = await this.redisClient.get(this.getRedisKey(params));
            if(!data) return null;
            try {
                return JSON.parse(data);
            } catch {
                // JSON 解析失败，说明存储的是普通字符串，直接返回原始数据
                return data as Value;
            }
        } catch (e) {
            console.error(`从 Redis 获取值时出错: ${e}`);
            return null;
        }
    }
    setRedisValue = async (params: Params, value: Value) => {
        try {
            let valueToSet: string;
            if (typeof value === 'string' || typeof value === 'number') {
                valueToSet = String(value);
            } else {
                valueToSet = JSON.stringify(value);
            }
            await this.redisClient.set(this.getRedisKey(params), valueToSet);
            return true;
        } catch (e) {
            console.error(`向 Redis 设置值时出错: ${e}`);
            return false;
        }
    }
    deleteRedisValue = async (params: Params) => {
        try{
            await this.redisClient.del(this.getRedisKey(params));
            return true;
        }catch(e) {
            console.error(`向 Redis 删除值时出错: ${e}`);
            return false;
        }
    }
    deleteAllRedisValues = async () => {
        return new Promise<boolean>((resolve, reject) => {
            const stream = this.redisClient.scanStream({
                match: `${this.redisKeyPrefix}*`
            });

            stream.on('data', async (keys) => {
                if (keys.length > 0) {
                    try {
                        await this.redisClient.del(...keys);
                        console.log(`成功删除 ${keys.length} 个键。`);
                    } catch (e) {
                        console.error(`删除键时出错: ${e}`);
                        reject(e);
                    }
                }
            });

            stream.on('end', () => {
                console.log('扫描结束');
                resolve(true);
            });

            stream.on('error', (e) => {
                console.error(`扫描键时出错: ${e}`);
                reject(e);
            });
        });
    }
}

const getArticleLikeCountByUserId = new RedisManager<{ userId: string | number }, { userId: number, like_count: number }>([TableNames.articles, TableNames.article_likes, TableNames.users ], 'getArticleLikeCountByUserId');

export const redisInstance = {
    getArticleLikeCountByUserId,
}