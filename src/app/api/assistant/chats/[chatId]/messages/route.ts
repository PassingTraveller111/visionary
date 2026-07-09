import {NextRequest} from "next/server";
import {apiHandler, ApiError} from "@/server/api/response";
import {sendMessage} from "@/server/assistant/assistant.service";
import type {ChatContent} from "@/shared/api/assistant";

type RouteContext = {
    params: Promise<{
        chatId: string;
    }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
    return apiHandler(async () => {
        const { chatId } = await context.params;
        const parsedChatId = Number(chatId);
        if (!Number.isInteger(parsedChatId) || parsedChatId <= 0) {
            throw new ApiError(400, 'invalid_chat_id', 'Invalid chat id');
        }

        const { messages } = await req.json() as { messages: ChatContent };
        const data = await sendMessage(parsedChatId, messages);
        if (!data) throw new ApiError(404, 'assistant_chat_not_found', 'Assistant chat not found');
        return data;
    });
}
