import { NextApiRequest } from 'next';
import {NextResponse} from "next/server";

export async function GET(req: NextApiRequest) {
    console.log('req', req);
    return NextResponse.json({ status: 200, message: 'hello world' }, { status: 200 });
}