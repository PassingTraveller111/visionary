// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import jwt from 'jsonwebtoken';
const secretKey = process.env.SECRET_KEY;
const expiresIn = 60 * 60 * 1000; // 1小时

export type decodeType = {
    username: string;
    iat: number; // token开始时间
    exp: number; // token到期时间
};

export const createToken = (username: string) => {
    /*
    * payload 一个对象，经过加密后存储到token里
    * secretKey 密钥，用来加密解密token
    * options {
    *   algorithm: 加密算法 对称算法HS256 非对称算法RS256
    *   expiresIn: 有效期 纯数字表示秒数，还可以用1h 30m 7d等。
    *   notBefore: 在一定时间以后生效
    * }
    * */
    return jwt.sign({ username }, secretKey, { expiresIn: Math.floor(new Date().getTime()) + expiresIn });
}

export const verifyToken = (token: string): decodeType => {
    return jwt.verify(token, secretKey);
}

export const accessDecode = (decode: decodeType) => {
    const { username, iat, exp } = decode;
    if ( exp && new Date().getTime() > exp ) {
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