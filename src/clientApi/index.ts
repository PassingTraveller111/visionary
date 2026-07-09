const API_CONFIG = {
    development: '/api/', // 本地开发接口访问，跟随当前启动端口
    // production: 'https://101.43.168.254/api/',
    production: 'https://visionaryblog.cn/api/', // 生产环境接口访问
    test: '',
};
export default API_CONFIG;

const currentEnv = process.env.NODE_ENV;
export const apiBaseUrl = API_CONFIG[currentEnv];


type ApiClientInit = RequestInit & {
    baseUrl?: string;
}

export const apiClient = async (endpoint = '', init?: ApiClientInit) => {
    try {
        const { baseUrl = apiBaseUrl, ...requestInit } = init ?? {};
        const url = `${baseUrl}${endpoint}`;
        const response = await fetch(url, {
            method: 'GET',
            ...requestInit,
        })
        return response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};
