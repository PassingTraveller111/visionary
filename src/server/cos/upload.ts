import COS from "cos-nodejs-sdk-v5";
import {validateImageFile} from "@/utils/imageUpload";

const cos = new COS({
    SecretId: process.env.UPLOAD_COS_SECRETID,
    SecretKey: process.env.UPLOAD_COS_SECRETKEY,
});

export type CosUploadResult = {
    statusCode: number;
    Location?: string;
};

export const uploadImageToCos = async (file: File, fileName: string) => {
    if (!fileName || fileName.includes('..') || fileName.startsWith('/')) {
        throw new Error('非法文件名');
    }

    const validation = await validateImageFile(file);
    if ('error' in validation) throw new Error(validation.error);

    return new Promise<CosUploadResult>((resolve, reject) => {
        cos.putObject({
            Bucket: process.env.UPLOAD_COS_BUCKET as string,
            Region: process.env.UPLOAD_COS_REGION as string,
            Key: fileName,
            Body: Buffer.from(validation.buffer),
            ContentType: validation.mimeType,
        }, (err, data) => {
            if (err) reject(err);
            else resolve(data as CosUploadResult);
        });
    });
}
