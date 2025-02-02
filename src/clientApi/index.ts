const API_CONFIG = {
    development: 'http://localhost:3000/api/',
    production: 'http://101.43.168.254/api/',
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
            },
            user: {
                updateUserInfo: 'protected/user/updateUserInfo', // 更新用户信息
                updateUserAvatar: 'protected/user/updateUserAvatar', // 更新用户头像
            },
            cos: {
                upload: 'protected/cos/upload', // 上传文件到cos
            }
        },
    },
    get: {
        // 受保护的请求
        protected: {
            user: {
                getUserInfo: 'protected/user/getUserInfo', // 获取用户信息
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
            headers: {
                'Content-Type': 'application/json' // 请求头
            },
            ...init,
        })
        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};