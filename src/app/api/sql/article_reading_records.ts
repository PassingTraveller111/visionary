import {query} from "@/app/api/utils";
import {article_reading_recordsTableType} from "@/app/api/sql/type";

// 获取某用户的浏览记录
const getArticleReadingRecordsByUserId = async (userId: number) => {
    return (await query(`SELECT * FROM article_reading_records WHERE user_id = ?`, [userId])) as [ article_reading_recordsTableType[] ] | null;
}
// 添加浏览记录
const insertArticleReadingRecord = async (article_id: number, user_id: number) => {
    return (await query(`INSERT INTO article_reading_records (article_id, user_id) VALUES (?, ?)`, [article_id, user_id])) as [ { insertId: number } ] | null;
}
// 获取某文章的浏览量
// const getArticleReadingRecordsByArticleId = async (article_id: number) => {
//     return (await query(`SELECT article_id, COUNT(*) FROM article_reading_records WHERE article_id = ?`, [article_id]))
// }

export const article_reading_records = {
    getArticleReadingRecordsByUserId,
    insertArticleReadingRecord,
}