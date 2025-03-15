import {NextRequest, NextResponse} from "next/server";
import {user} from "@/app/api/sql/user";
import {email_verification} from "@/app/api/sql/email_verification";
import {email_verificationTableType} from "@/app/api/sql/type";
import {userTableType} from "@/app/api/protected/user/type";
import {createToken} from "@/utils/auth";
import transporter from "@/lib/email";

type verifyCodeRequestType = {
    email: string;
    code: string;
}

export async function POST(req: NextRequest) {
    try {
        const data: verifyCodeRequestType = await req.json();
        const {
            email,
            code,
        } = data;
        if(!verifyRegex(email)) return NextResponse.json({ message: '请输入有效的邮箱地址', status: 400 }, { status: 400 });
        if(!await verifyCode(email, code)) return NextResponse.json({message: '验证码错误', status: 400 }, { status: 400 });
        const result = await user.getUserInfoByEmail(email);
        if(result){
            const [ rows ] = result;
            if(Array.isArray(rows) && rows.length > 0){
                // 已注册
                const userInfo = rows[0] as userTableType;
                return login(userInfo);
            }
        }
        // 未注册
        const userInfo = await createUser(email);
        if(userInfo){
            sendEmail(email, userInfo.username, userInfo.password);
            return login(userInfo);
        }
        return NextResponse.json({ status: 400, message: 'error' }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}


const verifyCode = async (email: string, code: string) => {
    const result = await email_verification.getEmailVerifyCode(email, code);
    if(result) {
        const [ rows ] = result;
        if(Array.isArray(rows) && rows.length > 0) {
            const res = rows[0] as email_verificationTableType;
            if(new Date(res.expired_at).getTime() < Date.now()){
                console.log('验证码已过期');
                return false; // 已过期
            }
        } else {
            console.log('验证码不存在')
            return false; // 不存在
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
            if(recordCount > 0) {
                repeat = true;
                continue;
            }
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
    }
    const result = await user.insertUser(userInfo);
    if(result){
        const [ rows ] = result;
        const insertId = (rows as { insertId: number }).insertId;
        if(insertId){
            return {
                ...userInfo,
                id: insertId,
            }
        }
    }
}

function generateUniqueUsernameFromEmail(email: string) {
    const prefix = email.split('@')[0];
    // 生成 3 位随机数字
    const randomDigits = Math.floor(Math.random() * 900) + 100;

    return `${prefix}${randomDigits}`;
}

function generateComplexPassword(length: number = 8) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    return password;
}

const login = (userInfo: Pick<userTableType, 'username' | 'role' | 'email' | 'password' | 'nick_name' | 'id'>) => {
    const token = createToken(userInfo.username, userInfo.id, userInfo.role);
    const response = NextResponse.json({
            status: 200,
            message: 'success',
            data: {
                ...userInfo,
                password: undefined
            } },
        { status: 200});
    response.cookies.set('token', token, {
        expires: new Date(new Date().getTime() + 1000 * 60 * 60 * 60),
        httpOnly: true,
        path: '/',
    })
    return response;
}

const sendEmail = (email: string, username: string, password: string) => {
    // 邮件选项
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '创见',
        text: `您已成功注册创见账号，以下是您的用户名与初始密码`,
        html: `<p>您的用户名是：<strong>${username}</strong>，密码是：<strong>${password}</strong></p>`
    };
    // 发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('发送邮件时出错:', error);
        } else {
            console.log('邮件发送成功:', info.response);
        }
        // 关闭传输对象
        transporter.close();
    });
}

const verifyRegex = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}