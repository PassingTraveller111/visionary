// lib/db.js
import mysql from 'mysql2/promise';

// const pool = mysql.createPool({
//     host: process.env.DATABASE_HOST, // 本地开发一般直接用localhost
//     user: process.env.DATABASE_USER, // 一般是root
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST || 'localhost', // 兜底默认值
    user: process.env.DATABASE_USER || 'root',      // 兜底默认值
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || '',
    waitForConnections: true,    // 连接数满时等待（而非直接报错）
    connectionLimit: 10,         // 池最大连接数（建议≤MySQL的max_connections）
    queueLimit: 0,               // 等待队列无限制
    idleTimeout: 30000,          // 新增：空闲连接30秒后自动释放
    enableKeepAlive: true,       // 新增：保持长连接，减少重建开销
    keepAliveInitialDelay: 0     // 新增：立即启动长连接检测
});

export default pool;
