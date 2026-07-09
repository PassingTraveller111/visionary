import {article_collections} from "@/app/api/sql/article_collections";
import type {ArticleCollectionItem, ArticleCollectionState} from "@/shared/api/article_collections";

export const setArticleIsCollected = async (userId: number, articleId: number, isCollected: boolean): Promise<ArticleCollectionState | null> => {
    if (isCollected) {
        const results = await article_collections.insertArticleCollection(userId, articleId);
        if (!results) return null;

        const [{ insertId }] = results;
        if (!insertId) return null;
        return { isCollected: 1 };
    }

    const results = await article_collections.deleteArticleCollection(userId, articleId);
    if (!results) return null;
    return { isCollected: 0 };
}

export const getArticleIsCollected = async (userId: number, articleId: number): Promise<ArticleCollectionState | null> => {
    const results = await article_collections.getArticleIsCollected(userId, articleId);
    if (!results) return null;

    const [ [ { isCollected } ] ] = results;
    return { isCollected: isCollected as 0 | 1 };
}

export const getArticleCollectionsByUserId = async (userId: number): Promise<ArticleCollectionItem[] | null> => {
    const results = await article_collections.getArticleCollectionsByUserId(userId);
    if (!results) return null;

    const [ rows ] = results;
    return rows as unknown as ArticleCollectionItem[];
}
