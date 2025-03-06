import {NextRequest, NextResponse} from "next/server";
import redis from "@/lib/redis";
import {getEmailTimeDownKey} from "@/app/api/redisKeys";
import {email_verification} from "@/app/api/sql/email_verification";
import transporter from "@/lib/email";

export type registerRequestType = {
    email: string;
}

export async function POST(req: NextRequest) {
    try {
        const data: registerRequestType = await req.json();
        const {
            email
        } = data;
        if(!verifyRegex(email)) return NextResponse.json({ message: '请输入有效的邮箱地址', status: 400 }, { status: 400 });
        if(!await verifySendTime(email)) return NextResponse.json({ message: '您在 1 分钟内已发送过验证码，请稍后再试', status: 400 }, { status: 400 });
        return sendVerificationEmail(email);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    } finally {
    }
}

// 验证发送时间
const verifySendTime = async (email: string) => {
    const lastSentTime = await redis.get(getEmailTimeDownKey(email));
    const limitTime = 60 * 1000; // 限制时间1分钟
    const currentTime = Date.now();
    if(lastSentTime) {
        if (currentTime - parseInt(lastSentTime) < limitTime) {
            return false;
        }
    }
    return true;
}
// 验证邮箱格式
export const verifyRegex = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

const sendVerificationEmail = async (email: string) => {
    // 生成验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // 记录发送时间
    await redis.set(getEmailTimeDownKey(email), Date.now());
    // 数据库插入验证码
    const result = await email_verification.setEmailVerifyCode(email, verificationCode);
    // 发送邮件
    sendEmail(email, verificationCode);
    return NextResponse.json({ status: 200, data: result ,msg: 'success' });
}

const sendEmail = (email: string, verificationCode: string) => {
    // 邮件选项
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: '创见',
        text: `您的验证码是：${verificationCode}，验证码有效期为 5分钟，请尽快完成注册/登录。`,
        html: `<p>您的邮箱注册验证码是：<strong>${verificationCode}</strong>，验证码有效期为 5分钟，请尽快完成注册/登录。</p>`
    };
    // 发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('发送邮件时出错:', error);
        } else {
            console.log('邮件发送成功:', info.response);
            console.log('验证码:', verificationCode);
        }
        // 关闭传输对象
        transporter.close();
    });
    return NextResponse.json({ status: 200, msg: 'success' }, { status: 200 });
}

