import nodemailer from 'nodemailer';

// 创建一个 SMTP 传输对象
const transporter = nodemailer.createTransport({
    // 使用 163 作为邮件服务提供商
    service: process.env.EMAIL_SERVICE,
    host: 'smtp.163.com', // 修改为 163 邮箱的 SMTP 服务器地址
    port: 465, // 163 邮箱使用 465 端口（SSL 加密）
    secure: true, // 使用 SSL 加密
    auth: {
        // 发件人的邮箱地址
        user: process.env.EMAIL_USER,
        // 发件人的邮箱密码或应用专用密码
        pass: process.env.EMAIL_AUTHORIZATION_CODE
    }
});

export default transporter;