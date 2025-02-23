

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


export {
     getUserInfoKey,
}