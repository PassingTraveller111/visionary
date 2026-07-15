import type {PoolConnection} from "mysql2/promise";
import {revalidatePath} from "next/cache";
import pool from "@/lib/db";
import type {draftTableType, reviewStatusType} from "@/server/sql/type";
import type {PublishDraftResult, UpdateDraftData} from "@/shared/api/draft";

export const upsertDraft = async (data: UpdateDraftData) => {
    const connection = await pool.getConnection();
    try {
        const { title, content, summary, tags, author_id, draftId, author_nickname, cover } = data;
        const sql = draftId === 'new'
            ? `INSERT INTO drafts (title, content, summary, tags, author_id, author_nickname, cover) VALUES (?,?,?,?,?,?,?)`
            : `UPDATE drafts SET content = ?, title = ?, summary = ?, tags = ?, cover = ?, update_time = ? WHERE id = ?;`;
        const values = draftId === 'new'
            ? [title, content, summary, tags, author_id, author_nickname, cover]
            : [content, title, summary, tags, cover, new Date(), draftId];
        const [ rows ] = await connection.execute(sql, values);
        return rows;
    } finally {
        connection.release();
    }
}

export const getDraftById = async (draftId: number) => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT * FROM drafts WHERE id = ?`, [draftId]);
        return Array.isArray(rows) && rows.length > 0 ? rows[0] as draftTableType : null;
    } finally {
        connection.release();
    }
}

export const getDraftListByAuthorId = async (authorId: number, viewerUserId: number) => {
    if (authorId !== viewerUserId) return null;
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT id, title, review_id, summary, cover, tags, update_time
                                                   FROM drafts
                                                   WHERE author_id = ? AND status = 'onlyDraft'
                                                   ORDER BY id DESC`, [authorId]);
        return rows;
    } finally {
        connection.release();
    }
}

export const deleteDraftById = async (draftId: number) => {
    const connection = await pool.getConnection();
    try {
        await connection.execute(`DELETE FROM drafts WHERE id = ? AND status = 'onlyDraft';`, [draftId]);
        return '删除成功';
    } finally {
        connection.release();
    }
}

export const canEditDraft = async (draftId: number | 'new', userId: number) => {
    if (draftId === 'new') return true;
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT author_id From drafts WHERE id = ?;`, [draftId]);
        return Array.isArray(rows) && rows.length > 0 && (rows[0] as { author_id: number }).author_id === userId;
    } finally {
        connection.release();
    }
}

export const publishDraftById = async (draftId: number): Promise<PublishDraftResult | null> => {
    const connection = await pool.getConnection();
    try {
        const [ rows ] = await connection.execute(`SELECT * FROM drafts WHERE id = ?`, [draftId]);
        if (!Array.isArray(rows) || rows.length === 0) return null;

        const draft = rows[0] as draftTableType;
        const reviewId = await insertReview(draft, connection);
        const articleId = draft.status === 'onlyDraft'
            ? await insertArticle(draft, reviewId, connection)
            : await updateArticle(draft, reviewId, connection);

        await updateReviewAndDraftWithArticleId(reviewId, draft.id, articleId, connection);
        if (draft.status === 'onlyDraft') await updateDraftStatus(draft, connection);
        scheduleAuditArticle(draft, articleId, reviewId);

        return { draft_id: draft.id, review_id: reviewId, article_id: articleId };
    } finally {
        connection.release();
    }
}

const insertReview = async (draft: draftTableType, connection: PoolConnection) => {
    const [ rows ] = await connection.execute(
        `INSERT INTO reviews (content, title, summary, tags, draft_id, author_id, status, cover) VALUES (?,?,?,?,?,?,?,?)`,
        [draft.content, draft.title, draft.summary, draft.tags, draft.id, draft.author_id, 'reviewing', draft.cover]
    );
    return (rows as { insertId: number }).insertId ?? 0;
}

const insertArticle = async (draft: draftTableType, reviewId: number, connection: PoolConnection) => {
    const [ rows ] = await connection.execute(`INSERT INTO articles
        (is_published, review_status, title, summary, content, author_id, published_time, updated_time, tags, author_nickname, draft_id, review_id, cover)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
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
        reviewId,
        draft.cover,
    ]);
    return (rows as { insertId: number }).insertId ?? 0;
}

const updateArticle = async (draft: draftTableType, reviewId: number, connection: PoolConnection) => {
    await connection.execute(`UPDATE articles SET review_status = ?, review_id = ? where id = ?;`, ['pending_review', reviewId, draft.article_id]);
    return draft.article_id ?? 0;
}

const updateReviewAndDraftWithArticleId = async (reviewId: number, draftId: number, articleId: number, connection: PoolConnection) => {
    await connection.execute(`UPDATE reviews SET article_id = ? WHERE id = ?`, [articleId, reviewId]);
    await connection.execute(`UPDATE drafts SET article_id = ? WHERE id = ?`, [articleId, draftId]);
}

const updateDraftStatus = async (draft: draftTableType, connection: PoolConnection) => {
    await connection.execute(`UPDATE drafts SET status = ? WHERE id = ?;`, ['hasArticle', draft.id]);
}

const scheduleAuditArticle = (draft: draftTableType, articleId: number, reviewId: number) => {
    setTimeout(async () => {
        const connection = await pool.getConnection();
        try {
            await connection.execute(`UPDATE articles SET
                is_published = ?,
                review_status = ?,
                title = ?,
                summary = ?,
                content = ?,
                author_id = ?,
                published_time = ?,
                updated_time = ?,
                tags = ?,
                author_nickname = ?,
                cover = ?
                WHERE id = ?`, [
                1,
                'already_review',
                draft.title,
                draft.summary,
                draft.content,
                draft.author_id,
                new Date(),
                new Date(),
                draft.tags,
                draft.author_nickname,
                draft.cover,
                articleId,
            ]);
            await updateReviewStatus(reviewId, 'review_success', connection);
            revalidatePath(`/reader/${articleId}`);
        } catch (error) {
            console.error(error);
        } finally {
            connection.release();
        }
    }, 1000 * 60);
}

const updateReviewStatus = async (reviewId: number, status: reviewStatusType, connection: PoolConnection) => {
    await connection.execute(`UPDATE reviews SET status = ? WHERE id = ?;`, [status, reviewId]);
}
