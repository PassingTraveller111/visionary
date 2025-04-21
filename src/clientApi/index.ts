const API_CONFIG = {
    development: 'http://localhost:3000/api/',
    // production: 'https://101.43.168.254/api/',
    production: 'https://visionaryblog.cn/api/',
    test: '',
};
export default API_CONFIG;

export const apiList = {
    post: {
        user: {
            jwt: 'user/jwt', // token解析
            login: 'user/login', // 用户登录
            logout: 'user/logout',
            register: {
                sendCode: 'user/register/sendCode', // 发送邮箱验证码
                verifyCode: 'user/register/verifyCode', // 验证邮箱验证码
            }
        },
        // 受保护的请求
        protected: {
            profile: {
                getProfile: 'protected/profile/getProfile', // 获取用户资料
                uploadAvatar: 'protected/profile/uploadAvatar', // 上传用户头像
            },
            user: {
                updateUserInfo: 'protected/user/updateUserInfo', // 更新用户信息
                updateUserAvatar: 'protected/user/updateUserAvatar', // 更新用户头像
                getAuthorInfo: 'protected/user/getAuthorInfo', // 获取作者信息
                getUserStatisticChart: 'protected/user/getUserStatisticChart', // 获取用户数据表格信息
            },
            cos: {
                upload: 'protected/cos/upload', // 上传文件到cos
            },
            article: {
                getArticle: 'protected/article/getArticle', // 获取文章
                getArticleList: 'protected/article/getArticleList', // 获取文章列表
                uploadImage: 'protected/article/uploadImage', // 上传文章图片
                uploadCover: 'protected/article/uploadCover', // 上传文章封面
                delArticle: 'protected/article/delArticle', // 删除文章
                getPublishedArticleList: 'protected/article/getPublishedArticleList', // 获取公开文章列表
                getArticleListByKeyWord: 'protected/article/getArticleListByKeyWord', // 模糊搜索文章
                getArticleCountByUserId: 'protected/article/getArticleCountByUserId', // 获取文章数量
                getArticleListToAddColumn: 'protected/article/getArticleListToAddColumn', // 获取专栏数三个以下的文章列表
                getArticleListByColumnId: 'protected/article/getArticleListByColumnId', // 获取专栏下的文章列表
            },
            article_likes: {
                getArticleIsLike: 'protected/article_likes/getArticleIsLike', // 获取是否喜欢该文章
                setArticleIsLike: 'protected/article_likes/setArticleIsLike', // 点赞/取消赞
                getArticleLikeCountByUserId: 'protected/article_likes/getArticleLikeCountByUserId', // 获取用户的总获赞数
            },
            draft: {
                updateDraft: 'protected/draft/updateDraft', // 更新草稿
                getDraft: 'protected/draft/getDraft', // 获取草稿
                publishDraft: 'protected/draft/publishDraft', // 发布草稿
                editorAuth: 'protected/draft/editorAuth', // 是否有编辑文章草稿的权限
                getDraftList: 'protected/draft/getDraftList', // 获取草稿列表
                delDraft: 'protected/draft/delDraft', // 删除草稿
            },
            review: {
                getReview: 'protected/review/getReview', // 获取审核文章
            },
            assistant: {
                insertChatRecord: 'protected/assistant/insertChatRecord', // 新建聊天记录
                getChatRecord: 'protected/assistant/getChatRecord', // 获取聊天记录
                sendMessage: 'protected/assistant/sendMessage', // 发送消息
            },
            article_reading_records: {
                insert: 'protected/article_reading_records/insertArticleReadingRecord', // 插入浏览记录
                getByUserId: 'protected/article_reading_records/getArticleReadingRecordsByUserId', // 获取用户浏览历史记录
                getLookCountByUserId: 'protected/article_reading_records/getLookCountsByUserId', // 获取用户的文章被阅读总量
            },
            article_collections: {
                setArticleIsCollected: 'protected/article_collections/setArticleIsCollected', // 设置是否收藏
                getArticleIsCollected: 'protected/article_collections/getArticleIsCollected', // 获取收藏数据
                getArticleCollectionsByUserId: 'protected/article_collections/getArticleCollectionsByUserId', // 获取收藏列表
            },
            article_comments: {
                sendArticleComment: 'protected/article_comments/sendComment', // 发送评论
                getCommentListByArticleId: 'protected/article_comments/getCommentListByArticleId', // 获取评论列表
                delComment: 'protected/article_comments/delComment', // 删除评论
            },
            columns: {
                uploadCover: 'protected/columns/uploadCover',  // 上传封面
                updateColumn: 'protected/columns/updateColumn', // 新建或更新Column
                getColumnsByUserId: 'protected/columns/getColumnsByUserId', // 获取专栏列表
                deleteColumn: 'protected/columns/deleteColumn', // 删除专栏
                getColumn: 'protected/columns/getColumn', // 获取专栏
                updateColumnArticleList: 'protected/columns/updateColumnArticleList', // 更新专栏的文章列表
            },
            diagrams: {
                updateDiagram: 'protected/diagrams/updateDiagram', // 插入和更新图表
                getDiagram: 'protected/diagrams/getDiagram', // 获取图表
            }
        },
    },
    get: {
        // 受保护的请求
        protected: {
            user: {
                getUserInfo: 'protected/user/getUserInfo', // 获取用户信息
                getUserStatistic: 'protected/user/getUserStatistic', // 获取用户数据
            },
            article: {
            },
            quotes: {
                getQuoteRandom: 'protected/quotes/getQuoteRandom', // 随机获取格言
            },
            diagrams: {
                getDiagramsList: 'protected/diagrams/getDiagramsList',
            }
        },
        user: {
            logout: 'user/logout', // 用户注销
        },
    }
}


const currentEnv = process.env.NODE_ENV;
export const apiBaseUrl = API_CONFIG[currentEnv];


export const apiClient = async (endpoint = '', init?: RequestInit) => {
    try {
        const url = `${apiBaseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            ...init,
        })
        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};