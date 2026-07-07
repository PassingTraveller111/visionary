import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60; // 1 hour

export type decodeType = {
    userId: number;
    username: string;
    role: 0 | 1 | 2; // 0 guide | admin | user
    iat: number; // token开始时间
    exp: number; // token到期时间
};

const getSecretKey = () => {
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) throw new Error('Missing SECRET_KEY');
    return secretKey;
}

export const createToken = (username: string, userId: number, role: 0 | 1 | 2, expiresIn = DEFAULT_EXPIRES_IN_SECONDS ) => {
    /*
    * payload 一个对象，经过加密后存储到token里
    * secretKey 密钥，用来加密解密token
    * options {
    *   algorithm: 加密算法 对称算法HS256 非对称算法RS256
    *   expiresIn: 有效期 纯数字表示秒数，还可以用1h 30m 7d等。
    *   notBefore: 在一定时间以后生效
    * }
    * */
    return jwt.sign({ username, userId, role }, getSecretKey(), { expiresIn });
}

export const verifyToken = (token: string): decodeType => {
    return jwt.verify(token, getSecretKey()) as decodeType;
}

export const accessDecode = (decode: decodeType) => {
    const { exp } = decode;
    if ( exp && Math.floor(Date.now() / 1000) > exp ) {
        return {
            access: false,
            msg: 'Token expired',
        }
    }
    return {
        access: true,
        msg: 'Token access',
    }
}
