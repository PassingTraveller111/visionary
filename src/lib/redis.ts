import Redis from 'ioredis';

// 创建Redis实例
const redis = new Redis({
    host: process.env.REDIS_HOST, // Redis服务器地址
    port: 6379, // Redis服务器端口
    password: process.env.REDIS_PASSWORD,
});

export default redis;