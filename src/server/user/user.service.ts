import pool from "@/lib/db";
import redis from "@/lib/redis";
import transporter from "@/lib/email";
import {createToken} from "@/utils/auth";
import {getEmailTimeDownKey} from "@/app/api/redisKeys";
import {email_verification} from "@/app/api/sql/email_verification";
import {user} from "@/app/api/sql/user";
import {uploadImageToCos} from "@/server/cos/upload";
import type {
    AuthorInfoType,
    LoginRequest,
    ProfileDto,
    RegisterVerifyCodeRequest,
    statisticDataType,
    updateUserInfoRequestType,
    UserDto,
    chartDataItemType,
} from "@/shared/api/user";
import type {email_verificationTableType, userTableType} from "@/app/api/sql/type";

export const login = async ({ username, password, isRemember = false }: LoginRequest) => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT * FROM users WHERE username = ?`, [username]);
        const users = rows as userTableType[];
        if (users.length === 0 || users[0]?.username !== username || users[0]?.password !== password) {
            return null;
        }

        const userInfo = { ...users[0] };
        delete (userInfo as Partial<userTableType>).password;
        const maxAge = isRemember ? 60 * 60 * 60 : undefined;
        return {
            userInfo: userInfo as UserDto,
            token: createToken(username, userInfo.id, userInfo.role, maxAge),
            expires: isRemember ? new Date(Date.now() + 1000 * 60 * 60 * 60) : undefined,
        };
    } finally {
        connection.release();
    }
}

export const getUserInfo = async (userId: number): Promise<UserDto | null> => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT profile, id, email, nick_name, create_time, first_name, last_name, role, username FROM users WHERE id = ?`, [ userId ]);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] as UserDto : null;
    } finally {
        connection.release();
    }
}

export const updateUserInfo = async (userId: number, data: updateUserInfoRequestType) => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`UPDATE users SET nick_name = ? WHERE id = ?`, [data.nick_name, userId]);
        return rows;
    } finally {
        connection.release();
    }
}

export const updateUserAvatar = async (userId: number, avatarUrl: string) => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`UPDATE users SET profile = ? WHERE id = ?`, [avatarUrl, userId]);
        return rows;
    } finally {
        connection.release();
    }
}

export const uploadUserAvatar = async (userId: number, file: File) => {
    const result = await uploadImageToCos(file, `profile/${userId}-${Date.now()}-${file.name}`);
    if (result.statusCode !== 200) throw new Error('上传失败');
    return result;
}

export const getAuthorInfo = async (authorId: number): Promise<AuthorInfoType | null> => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT id, email, profile, nick_name FROM users WHERE id = ?`, [authorId]);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] as AuthorInfoType : null;
    } finally {
        connection.release();
    }
}

export const getProfile = async (userId: number): Promise<ProfileDto | null> => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT id, username, profile, nick_name FROM users WHERE id = ?`, [userId]);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] as ProfileDto : null;
    } finally {
        connection.release();
    }
}

export const getUserStatistic = async (userId: number): Promise<statisticDataType | null> => {
    const res = await user.getUserStatistic(userId);
    if (!res) return null;
    const [ rows ] = res;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export const getUserStatisticChart = async (userId: number, startDate: string, endDate: string): Promise<chartDataItemType[] | null> => {
    const res = await user.getUserStatisticChart(userId, startDate, endDate);
    if (!res) return null;
    const [ rows ] = res;
    return Array.isArray(rows) ? rows as chartDataItemType[] : null;
}

export const sendRegisterCode = async (email: string) => {
    if(!verifyEmail(email)) return { status: 400, message: '请输入有效的邮箱地址' };
    if(!await verifySendTime(email)) return { status: 400, message: '您在 1 分钟内已发送过验证码，请稍后再试' };

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.set(getEmailTimeDownKey(email), Date.now());
    const result = await email_verification.setEmailVerifyCode(email, verificationCode);
    sendEmail(email, '创见', `您的验证码是：${verificationCode}，验证码有效期为 5分钟，请尽快完成注册/登录。`, `<p>您的邮箱注册验证码是：<strong>${verificationCode}</strong>，验证码有效期为 5分钟，请尽快完成注册/登录。</p>`);
    return { status: 200, data: result, msg: 'success' as const };
}

export const verifyRegisterCode = async ({ email, code }: RegisterVerifyCodeRequest) => {
    if(!verifyEmail(email)) return { status: 400, message: '请输入有效的邮箱地址' };
    if(!await verifyCode(email, code)) return { status: 400, message: '验证码错误' };

    const result = await user.getUserInfoByEmail(email);
    if(result){
        const [ rows ] = result;
        if(Array.isArray(rows) && rows.length > 0){
            return createLoginPayload(rows[0] as userTableType);
        }
    }

    const userInfo = await createUser(email);
    if(userInfo){
        sendEmail(email, '创见', `您已成功注册创见账号，以下是您的用户名与初始密码`, `<p>您的用户名是：<strong>${userInfo.username}</strong>，密码是：<strong>${userInfo.password}</strong></p>`);
        return createLoginPayload(userInfo as userTableType);
    }
    return { status: 400, message: 'error' };
}

const createLoginPayload = (userInfo: Pick<userTableType, 'username' | 'role' | 'email' | 'password' | 'nick_name' | 'id'>) => {
    const token = createToken(userInfo.username, userInfo.id, userInfo.role, 60 * 60 * 60);
    return {
        status: 200,
        message: 'success',
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 60),
        data: {
            ...userInfo,
            password: undefined,
        },
    };
}

const verifyCode = async (email: string, code: string) => {
    const result = await email_verification.getEmailVerifyCode(email, code);
    if(result) {
        const [ rows ] = result;
        if(Array.isArray(rows) && rows.length > 0) {
            const res = rows[0] as email_verificationTableType;
            if(new Date(res.expired_at).getTime() < Date.now()) return false;
        } else {
            return false;
        }
    }
    return true;
}

const createUser = async (email: string) => {
    let repeat = true;
    let username = '';
    while(repeat) {
        username = generateUniqueUsernameFromEmail(email);
        const result = await user.countByUsername(username);
        if(result){
            const [ [ { recordCount } ] ] = result;
            if(recordCount > 0) continue;
        }
        repeat = false;
    }
    const password = generateComplexPassword();
    const userInfo: Pick<userTableType, 'username' | 'role' | 'email' | 'password' | 'nick_name'> = {
        email,
        username,
        nick_name: username,
        role: 1,
        password,
    };
    const result = await user.insertUser(userInfo);
    if(result){
        const [ rows ] = result;
        const insertId = (rows as { insertId: number }).insertId;
        if(insertId) return { ...userInfo, id: insertId };
    }
}

const verifySendTime = async (email: string) => {
    const lastSentTime = await redis.get(getEmailTimeDownKey(email));
    const currentTime = Date.now();
    return !lastSentTime || currentTime - parseInt(lastSentTime) >= 60 * 1000;
}

const verifyEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function generateUniqueUsernameFromEmail(email: string) {
    const prefix = email.split('@')[0];
    const randomDigits = Math.floor(Math.random() * 900) + 100;
    return `${prefix}${randomDigits}`;
}

function generateComplexPassword(length: number = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) password += characters.charAt(Math.floor(Math.random() * characters.length));
    return password;
}

const sendEmail = (email: string, subject: string, text: string, html: string) => {
    transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject, text, html }, (error, info) => {
        if (error) console.log('发送邮件时出错:', error);
        else console.log('邮件发送成功:', info.response);
        transporter.close();
    });
}
