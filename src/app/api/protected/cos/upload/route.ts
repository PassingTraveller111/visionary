import COS from "cos-nodejs-sdk-v5";
import {NextRequest, NextResponse} from "next/server";
import {verifyToken} from "@/utils/auth";

const cos = new COS({
    SecretId: process.env.UPLOAD_COS_SECRETID,
    SecretKey: process.env.UPLOAD_COS_SECRETKEY,
});

const putObject = async (fileBuffer: Buffer, fileName: string) => {
    return new Promise((resolve, reject) => {
        cos.putObject({
            Bucket: process.env.UPLOAD_COS_BUCKET as string, // 填入您自己的存储桶，必须字段
            Region: process.env.UPLOAD_COS_REGION as string,  // 存储桶所在地域，例如 ap-beijing，必须字段
            Key: fileName,  // 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段
            Body: fileBuffer, // 上传文件对象，必须字段
            onProgress: function(progressData) {
                console.log(JSON.stringify(progressData));
            }
        }, function(err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ msg: '未找到文件', error: 'No file provided' }, { status: 400 });
        }
        // 文件格式转换
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const fileName = file.name;
        // 生成文件id
        const token = req.cookies.get('token')?.value ?? ''; // 从cookie中获取token
        const { userId } = verifyToken(token);
        const avatarName = createAvatarName(userId, fileName);
        const res = await putObject(fileBuffer, avatarName);
        return NextResponse.json({ msg: 'success', data: res }, { status: 200 });
    } catch (error) {
        console.error('上传文件到 COS 时出错:', error);
        return NextResponse.json({ msg: '上传失败', error: error }, { status: 500 });
    }
}

const createAvatarName = (userId: number, fileName: string) => {
    return `profile/${userId}-${Date.now()}-${fileName}`;
}