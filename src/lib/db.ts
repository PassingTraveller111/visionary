// lib/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    // host: 'localhost', // 本地开发一般直接用localhost
    // user: 'root', // 一般是root
    // password: 'hjl19991104',
    // database: 'visionary',
    host: process.env.DATABASE_HOST, // 本地开发一般直接用localhost
    user: process.env.DATABASE_USER, // 一般是root
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
