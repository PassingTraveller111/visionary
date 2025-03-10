import {apiClient, apiList} from "@/clientApi";
import {
    insertArticleReadingRecordRequestType, insertArticleReadingRecordResponseType
} from "@/app/api/protected/article_reading_records/insertArticleReadingRecord/route";
import {useCallback} from "react";


export const useInsertArticleReadingRecord = () => {
    return  useCallback(async (article_id: number, user_id: number) => {
        if(article_id === 0 || user_id === 0) return;
        const apiData: insertArticleReadingRecordRequestType = {
            articleId: article_id,
            userId: user_id,
        }
        const res: insertArticleReadingRecordResponseType = await apiClient(apiList.post.protected.article_reading_records.insert, {
            method: "POST",
            body: JSON.stringify(apiData)
        });
        console.log(res);
    }, [])
}