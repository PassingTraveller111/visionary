import axios from 'axios';

const API_CONFIG = {
    development: 'http://localhost:3000/api/',
    production: '',
    test: '',
};
export default API_CONFIG;

export const apiList = {
    post: {
        user: {
            jwt: 'user/jwt', // token解析
            login: 'user/login', // 用户登录
        }
    },
    get: {
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
const apiBaseUrl = API_CONFIG[currentEnv];


export const apiClient = async (endpoint = '', method = 'GET', data: unknown = null) => {
    try {
        const url = `${apiBaseUrl}${endpoint}`;
        const response = await axios({
            method,
            url,
            data
        });
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};