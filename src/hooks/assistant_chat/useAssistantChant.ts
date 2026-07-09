import {useCallback, useState} from "react";
import {apiClient} from "@/clientApi";
import {
    AssistantChatRecord,
    ChatContent,
    insertChatRecordRequestType,
    sendMessageRequestType,
    sendMessageResponse
} from "@/shared/api/assistant";
import {useDispatch} from "react-redux";
import {setAssistant} from "@/store/features/assistantSlice";
import type {ApiResponse} from "@/shared/api/response";


export const useInitAssistantChat = () => {
    const dispatch = useDispatch();
    return useCallback(async (draft_id: number, isNew: boolean = true) => {
        const apiData: insertChatRecordRequestType = {
            draft_id,
        }
        if (isNew) {
            // 新建聊天记录
            const res = await apiClient(`drafts/${apiData.draft_id}/assistant-chat`, {
                method: 'POST',
            }) as ApiResponse<AssistantChatRecord>;
            if(res.ok) {
                dispatch(setAssistant({
                    chat_id: res.data.chat_id,
                    chat_content: res.data.chat_content ?? [],
                    draft_id: res.data.draft_id,
                }));
            }
        } else {
            // 获取聊天记录
            const res = await apiClient(`drafts/${apiData.draft_id}/assistant-chat`) as ApiResponse<AssistantChatRecord>;
            if(res.ok) {
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
    const sendMessage = useCallback(async (chat_id: number, message: ChatContent) => {
        const apiData: sendMessageRequestType = {
            chat_id,
            messages: message,
        }
        setIsLoading(true);
        const res = await apiClient(`assistant/chats/${apiData.chat_id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ messages: apiData.messages }),
        }) as ApiResponse<ChatContent>;
        setIsLoading(false);
        if (res.ok) return { msg: 'success' as const, data: res.data } satisfies sendMessageResponse;
        return { msg: 'error' as const } satisfies sendMessageResponse;
    }, []);
    return {
        isLoading,
        setIsLoading,
        sendMessage,
    }
}
