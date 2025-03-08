import {useCallback, useState} from "react";
import {apiClient, apiList} from "@/clientApi";
import {
    insertChatRecordRequestType,
    insertChatRecordResponseType
} from "@/app/api/protected/assistant/insertChatRecord/route";
import {useDispatch} from "react-redux";
import {setAssistant} from "@/store/features/assistantSlice";
import {getChatRecordResponseType} from "@/app/api/protected/assistant/getChatRecord/route";
import {chatContentType} from "@/app/api/sql/type";
import {sendMessageRequestType, sendMessageResponse} from "@/app/api/protected/assistant/sendMessage/route";


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


export const useSendMessage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const sendMessage = useCallback(async (chat_id: number, message: chatContentType) => {
        const apiData: sendMessageRequestType = {
            chat_id,
            messages: message,
        }
        setIsLoading(true);
        const res: sendMessageResponse = await apiClient(apiList.post.protected.assistant.sendMessage, {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
        setIsLoading(false);
        return res;
    }, []);
    return {
        isLoading,
        setIsLoading,
        sendMessage,
    }
}