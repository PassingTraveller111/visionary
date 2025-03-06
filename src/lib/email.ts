import nodemailer from 'nodemailer';

// 创建一个 SMTP 传输对象
const transporter = nodemailer.createTransport({
    // 使用 QQ 作为邮件服务提供商
    service: process.env.EMAIL_SERVICE,
    auth: {
        // 发件人的邮箱地址
        user: process.env.EMAIL_USER,
        // 发件人的邮箱密码或应用专用密码
        pass: process.env.EMAIL_AUTHORIZATION_CODE
    }
});

export default transporter;