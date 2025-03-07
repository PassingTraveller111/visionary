import {NextRequest, NextResponse} from "next/server";
import {openai} from "@/lib/assistant";

export type messageType = {
    role: 'user' | 'assistant',
    content: string,
};

export type assistantRequestType = {
    messages: messageType[];
}

export async function POST(req: NextRequest) {
    const data: assistantRequestType = await req.json();
    console.log('data', data);
    const completion = await openai.chat.completions.create({
        messages: data.messages,
        model: "deepseek-chat",
    });
    return NextResponse.json({ data: completion });
}