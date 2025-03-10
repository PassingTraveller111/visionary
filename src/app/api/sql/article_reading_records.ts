import {query} from "@/app/api/utils";
import {article_reading_recordsTableType} from "@/app/api/sql/type";
import {articleTableType} from "@/app/api/protected/article/type";

// 获取某用户的浏览记录
const getArticleReadingRecordsByUserId = async (userId: number, pageNum: number = 0, pageSize: number = 8) => {
    const offset = pageNum * pageSize;
    return (await query(`SELECT record_id, article_id, read_time, title, summary, author_nickname
                         FROM article_reading_records AS ar
                         LEFT JOIN articles AS al
                         ON al.id = ar.article_id
                         WHERE user_id = ? ORDER BY read_time DESC
                         LIMIT ${offset},${pageSize}`
        , [userId])) as [ (article_reading_recordsTableType & Pick<articleTableType, 'title' | 'summary' | 'author_nickname'>)[] ] | null;
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