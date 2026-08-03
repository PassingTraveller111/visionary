import {article_reading_records} from "@/server/sql/article_reading_records";
import type {ArticleReadingRecordItem, LookCount} from "@/shared/api/article_reading_records";

export const insertArticleReadingRecord = async (articleId: number, userId: number | null, visitorId?: string) => {
    const results = userId
        ? await article_reading_records.insertArticleReadingRecord(articleId, userId)
        : visitorId
            ? await article_reading_records.insertAnonymousArticleReadingRecord(articleId, visitorId)
            : null;
    if (!results) return null;

    const [{ affectedRows }] = results;
    return { inserted: affectedRows > 0 };
}

export const getArticleReadingRecordsByUserId = async (userId: number, pageNum = 0, pageSize = 8): Promise<ArticleReadingRecordItem[] | null> => {
    const results = await article_reading_records.getArticleReadingRecordsByUserId(userId, pageNum, pageSize);
    if (!results) return null;

    const [ rows ] = results;
    return rows as ArticleReadingRecordItem[];
}

export const getLookCountsByUserId = async (userId: number): Promise<LookCount | null> => {
    const results = await article_reading_records.getArticleReadingRecordsCountByUserId(userId);
    if (!results) return null;

    const [ rows ] = results;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as LookCount : null;
}
