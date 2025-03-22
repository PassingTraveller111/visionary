import {NextRequest, NextResponse} from "next/server";
import {article_comments} from "@/app/api/sql/article_comments";
import {article_commentsTableType} from "@/app/api/sql/type";

export type getCommentListByArticleIdReqType = {
    article_id: number;
}

export type getCommentListByArticleIdResType = {
    data: commentItem[];
    msg: 'success' | 'error';
}

export type userInfoType = {
    id: number;
    nickname: string;
    avatar: string;
}
export type commentItem = article_commentsTableType & {
    children: commentItem[];
    userInfo: userInfoType;
    replyComment?: {
        id: number;
        userInfo: userInfoType;
    };
}

export async function POST(req: NextRequest){
    try {
        const data: getCommentListByArticleIdReqType = await req.json();
        const res = await article_comments.getCommentListByArticleId(data.article_id);
        if(res){
            const [ rows ] = res;
            if(Array.isArray(rows) && rows.length > 0){
                const result: commentItem[] = [];
                const commentMap: {
                    [key: string]: commentItem
                } = {};
                rows.forEach(comment => {
                    commentMap[comment.comment_id] = comment;
                    comment.children = [];
                });
                rows.forEach(comment => {
                    if (comment.parent_comment_id === null) {
                        result.push(comment);
                    } else {
                        const parentComment = commentMap[comment.parent_comment_id];
                        if (parentComment) {
                            parentComment.children.push(comment);
                            comment.replyComment = {
                                id: parentComment.comment_id,
                                userInfo: parentComment.userInfo,
                            };
                        }
                    }
                });
                return NextResponse.json({ msg: 'success', data: result }, { status: 200 });
            }
        }
        return NextResponse.json({ msg: 'error' });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ msg: 'error', data: error });
    }

}