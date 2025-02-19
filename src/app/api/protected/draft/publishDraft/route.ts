import {NextRequest, NextResponse} from "next/server";
import pool from "@/lib/db";
import {draftTableType} from "@/app/api/protected/draft/type";
import {PoolConnection} from "mysql2/promise";
import {reviewStatusType} from "@/app/api/protected/review/type";

export type publishDraftDataType = {
    draftId: number;
}

export type publishDraftResponseType = {
    data: draftTableType,
    msg: 'success' | 'error',
}

export async function POST(req: NextRequest) {
    try {
        const connection = await pool.getConnection();
        const data: publishDraftDataType = await req.json();
        const sql = `SELECT * FROM drafts WHERE id = ?`;
        const values = [data.draftId];
        const [ rows ] = await connection.execute(sql, values);
        if(Array.isArray(rows) && rows.length > 0) {
            // 先查找草稿信息
            const draft = rows[0] as draftTableType;
            // 新建审核文章
            const review_id = await insertReview(draft, connection);
            let article_id = 0;
            if (draft.status === 'onlyDraft') {
                // 第一次发布
                // 新建文章
                article_id = await insertArticle(draft, review_id, connection) ?? 0;
            } else {
                // 更新文章
                article_id = await updateArticle(draft, review_id, connection)
            }
            // 文章id关联回审核文章
            await updateReviewAndDraftWithArticleId(review_id, draft.id, article_id, connection);
            if(draft.status === 'onlyDraft'){
                // 草稿状态改为hasArticle
                await updateDraftStatus(draft, connection);
            }
            // 发起审核
            auditArticle(draft, article_id, review_id, connection);
            return NextResponse.json({ msg: 'success', data: { draft_id: draft.id, review_id, article_id }}, { status: 200 });
        } else {
            return NextResponse.json({ msg: 'error', data: '发布失败' }, { status: 200 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ status: 200, msg: 'error' }, { status: 200 });
    }
}

const insertReview = async (draft: draftTableType, connection: PoolConnection): Promise<number> => {
    const sql = `INSERT INTO reviews (content, title, summary, tags, draft_id, author_id, status) VALUES (?,?,?,?,?,?,?)`;
    const values = [draft.content, draft.title, draft.summary, draft.tags, draft.id, draft.author_id, 'reviewing'];
    const [ rows ] = await connection.execute(sql, values);
    const insertId = (rows as { insertId: number }).insertId;
    return insertId ?? 0;
}
const updateReviewAndDraftWithArticleId = async (review_id: number, draft_id: number, article_id: number, connection: PoolConnection) => {
    const reSql = `UPDATE reviews SET articke_id = ? WHERE id = ?`;
    const drSql = `UPDATE drafts SET article_id = ? WHERE id = ?`;
    const reValues = [article_id, review_id];
    const drValues = [article_id, draft_id];
    try {
        await connection.execute(reSql, reValues);
        await connection.execute(drSql, drValues);
    } catch (error) {
        console.error(error);
    }
}

const insertArticle = async (draft: draftTableType, review_id: number, connection: PoolConnection) => {
    // 文章发布状态设为未发布
    // 文章审核状态设为待审核
    const sql = `INSERT INTO articles 
    (is_published, review_status, title, summary, content, author_id, published_time, updated_time, tags, author_nickname, draft_id, review_id)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
    const values = [
        0,
        'pending_review',
        draft.title,
        draft.summary,
        draft.content,
        draft.author_id,
        new Date(),
        new Date(),
        draft.tags,
        draft.author_nickname,
        draft.id,
        review_id];
    const [ rows ] = await connection.execute(sql, values);
    const insertId = (rows as { insertId: number }).insertId;
    return insertId ?? 0;
}
const updateArticle = async (draft: draftTableType, review_id: number, connection: PoolConnection): Promise<number> => {
    // 文章发布状态不变
    // 文章审核状态设为待审核
    // 文章内容不变
    const sql = `UPDATE articles SET review_status = ?, review_id = ? where id = ?;`;
    const values = ['pending_review', review_id, draft.article_id];
    await connection.execute(sql, values);
    return draft.article_id ?? 0;
}

const updateDraftStatus = async (draft: draftTableType, connection: PoolConnection) => {
    const sql = `UPDATE drafts SET status = ? WHERE id = ?;`
    const values = ['hasArticle', draft.id];
    await connection.execute(sql, values);
}

const auditArticle = (draft: draftTableType, article_id: number, review_id: number,connection: PoolConnection) => {
    // 模拟异步审核任务
    setTimeout(async () => {
        // 根据草稿内容进行审核

        // 审核通过后修改文章状态(发布，审核通过)，更新文章内容为通过审核内容
        const sql = `UPDATE articles SET 
                    is_published = ?, 
                    review_status = ?,
                    title = ?,
                    summary = ?,
                    content = ?,
                    author_id = ?,
                    published_time = ?,
                    updated_time = ?,
                    tags = ?,
                    author_nickname = ?
                WHERE id = ?`;
        const values = [1, 'already_review',
            draft.title,
            draft.summary,
            draft.content,
            draft.author_id,
            new Date(),
            new Date(),
            draft.tags,
            draft.author_nickname,
            article_id];
        await connection.execute(sql, values);
        // 修改审核稿状态
        await updateReviewStatus(review_id, 'review_success', connection);
    }, 1000 * 60);
    return true;
};

const updateReviewStatus = async (review_id: number, status: reviewStatusType, connection: PoolConnection) => {
    const sql = `UPDATE reviews SET status = ? WHERE id = ?;`;
    await connection.execute(sql, [ status, review_id ]);
}