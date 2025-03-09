

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