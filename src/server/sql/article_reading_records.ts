import {query} from "@/server/db/query";
import {article_reading_recordsTableType} from "@/server/sql/type";
import {articleTableType} from "@/server/sql/type";

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
    return (await query(`INSERT INTO article_reading_records (article_id, user_id) VALUES (?, ?)`, [article_id, user_id])) as [ { insertId: number, affectedRows: number } ] | null;
}

const insertAnonymousArticleReadingRecord = async (articleId: number, visitorId: string) => {
    return (await query(`INSERT INTO article_reading_records (article_id, user_id, visitor_id)
                         SELECT a.id, NULL, ?
                         FROM articles a
                         WHERE a.id = ?
                           AND a.is_published = 1
                           AND a.view_permission = 'all'
                           AND NOT EXISTS (
                             SELECT 1
                             FROM article_reading_records
                             WHERE article_id = ?
                               AND visitor_id = ?
                               AND read_time >= DATE_SUB(NOW(), INTERVAL 30 MINUTE)
                           )`, [visitorId, articleId, articleId, visitorId])) as [ { insertId: number, affectedRows: number } ] | null;
}
// 获取某用户的文章被阅读总量
const getArticleReadingRecordsCountByUserId = async (userId: number) => {
    return (await query(`SELECT COUNT(*) as look_count, user_id FROM article_reading_records WHERE user_id = ? GROUP BY user_id`, [userId])) as [ [ { user_id: number, look_count:number } ] ] | null;
}

export const article_reading_records = {
    getArticleReadingRecordsByUserId,
    insertArticleReadingRecord,
    insertAnonymousArticleReadingRecord,
    getArticleReadingRecordsCountByUserId,
}
