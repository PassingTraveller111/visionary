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
            },
            cos: {
                upload: 'protected/cos/upload', // 上传文件到cos
            },
            article: {
                getArticle: 'protected/article/getArticle', // 获取文章
                getArticleList: 'protected/article/getArticleList', // 获取文章列表
                uploadImage: 'protected/article/uploadImage', // 上传文章图片
                delArticle: 'protected/article/delArticle', // 删除文章
                getPublishedArticleList: 'protected/article/getPublishedArticleList', // 获取公开文章列表
                getArticleListByKeyWord: 'protected/article/getArticleListByKeyWord', // 模糊搜索文章
            },
            article_likes: {
                getArticleIsLike: 'protected/article_likes/getArticleIsLike', // 获取是否喜欢该文章
                setArticleIsLike: 'protected/article_likes/setArticleIsLike', // 点赞/取消赞
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
            }
        },
    },
    get: {
        // 受保护的请求
        protected: {
            user: {
                getUserInfo: 'protected/user/getUserInfo', // 获取用户信息
            },
            article: {
            }
        },
        user: {
            logout: 'user/logout', // 用户注销
        }
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