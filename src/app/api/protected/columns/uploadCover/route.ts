import {NextRequest, NextResponse} from "next/server";
import {verifyToken} from "@/utils/auth";
import {apiClient, apiList} from "@/clientApi";


export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ msg: '未找到文件', error: 'No file provided' }, { status: 400 });
        }
        // 生成文件id
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const { userId } = verifyToken(token);
        const coverName = createCoverName(userId, file.name);
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("fileName", coverName);
        const res = await apiClient(apiList.post.protected.cos.upload, {
            method: 'POST',
            body: uploadData,
            headers: {
                // 内部发起请求需要带上cookie鉴权
                Cookie: req.cookies.toString()
            }
        })
        return NextResponse.json({ msg: 'success', data: res.data }, { status: 200 });
    } catch (error) {
        console.error('上传文件到 COS 时出错:', error);
        return NextResponse.json({ msg: '上传失败', error: error }, { status: 500 });
    }
}

const createCoverName = (userId: number, fileName: string) => {
    return `column_cover/${userId}-${Date.now()}-${fileName}`;
}