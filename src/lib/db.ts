// lib/db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost', // 本地开发一般直接用localhost
    user: 'root', // 一般是root
    password: 'hjl19991104',
    database: 'visionary',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export default pool;
