import {useCallback} from "react";
import {apiClient, apiList} from "@/clientApi";
import {
    insertChatRecordRequestType,
    insertChatRecordResponseType
} from "@/app/api/protected/assistant/insertChatRecord/route";
import {useDispatch} from "react-redux";
import {setAssistant} from "@/store/features/assistantSlice";
import {getChatRecordResponseType} from "@/app/api/protected/assistant/getChatRecord/route";


export const useInitAssistantChat = () => {
    const dispatch = useDispatch();
    return useCallback(async (draft_id: number, isNew: boolean = true) => {
        const apiData: insertChatRecordRequestType = {
            draft_id,
        }
        if (isNew) {
            // 新建聊天记录
            const res: insertChatRecordResponseType = await apiClient(apiList.post.protected.assistant.insertChatRecord, {
                method: 'POST',
                body: JSON.stringify(apiData),
            });
            if(res.msg == "success") {
                dispatch(setAssistant({
                    chat_id: res.data.chat_id,
                    chat_content: res.data.chat_content ?? [],
                    draft_id: res.data.draft_id,
                }));
            }
        } else {
            // 获取聊天记录
            const res: getChatRecordResponseType = await apiClient(apiList.post.protected.assistant.getChatRecord, {
                method: 'POST',
                body: JSON.stringify(apiData),
            });
            if(res.msg == "success") {
                dispatch(setAssistant({
                    chat_id: res.data.chat_id,
                    chat_content: res.data.chat_content ?? [],
                    draft_id: res.data.draft_id,
                }));
            }
        }

    }, [dispatch])
}