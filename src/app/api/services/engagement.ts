import {article_likes} from "@/app/api/sql/article_likes";
import {article_reading_records} from "@/app/api/sql/article_reading_records";

export type getArticleLikeCountByUserIdRequestType = {
    userId: number;
}

export type getArticleLikeCountByUserIdResponseType = {
    msg: 'success';
    data: {
        userId: number;
        like_count: number;
    };
} | {
    msg: 'error';
}

export type getLookCountsByUserIdRequestType = {
    userId: number;
}

export type getLookCountsByUserIdResponseType = {
    msg: 'success';
    data: {
        user_id: number;
        look_count: number;
    }
} | {
    msg: 'error';
}

export const getArticleLikeCountByUserId = async (userId: number) => {
    const result = await article_likes.getArticleLikeCountByUserId(userId);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

export const getLookCountsByUserId = async (userId: number) => {
    const result = await article_reading_records.getArticleReadingRecordsCountByUserId(userId);
    if (!result) return null;
    const [ rows ] = result;
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}
