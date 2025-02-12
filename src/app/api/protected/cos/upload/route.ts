import COS from "cos-nodejs-sdk-v5";
import {NextRequest, NextResponse} from "next/server";
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

/**
 *
 * @param req
 * formData {
 *     file: File \ null
 *     fileName: string
 * }
 * @constructor
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const fileName = formData.get('fileName') as string;
        if (!file) {
            return NextResponse.json({ msg: '未找到文件', error: 'No file provided' }, { status: 400 });
        }
        // 文件格式转换
        const buffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        // 上传文件
        const res = await putObject(fileBuffer, fileName) as { statusCode: number };
        if (res.statusCode === 200)
        return NextResponse.json({ msg: 'success', data: res }, { status: 200 });
        else return NextResponse.json({ msg: 'error', data: res }, { status: 500 });
    } catch (error) {
        console.error('上传文件到 COS 时出错:', error);
        return NextResponse.json({ msg: '上传失败', error: error }, { status: 500 });
    }
}