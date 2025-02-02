import COS from "cos-nodejs-sdk-v5";
import { NextResponse } from "next/server";

const cos = new COS({
    SecretId: process.env.UPLOAD_COS_SECRETID,
    SecretKey: process.env.UPLOAD_COS_SECRETKEY,
});


const getService = async () => {
    return new Promise((resolve, reject) => {
        cos.getService(function (err, data) {
            console.log(data && data.Buckets);
            if(data) resolve(data);
            else reject(err);
        });
    })
}

export async function GET() {
    const res = await getService();
    return NextResponse.json({ msg: 'success', data: res }, { status: 200 })
}