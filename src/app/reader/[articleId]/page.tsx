"use client"
import {useParams, useRouter} from "next/navigation";
import { useAppSelector } from "@/store";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useArticleLike, useGetArticle} from "@/hooks/articles/useArticles";
import ReaderHeader from "@/components/ReaderHeader";
import NavLayout from "@/components/NavLayout";
import ReactMarkdown from "@/components/ReactMarkdown";
import styles from './index.module.scss';
import Image from "next/image";
import {useGetAuthorInfo} from "@/hooks/users/useUsers";
import {Anchor, Button, Input, Popconfirm} from "antd";
import {iconColors, IconFont} from "@/components/IconFont";
import {useInsertArticleReadingRecord} from "@/hooks/article_reading_records/useArticleReadingRecords";
import useMessage from "antd/es/message/useMessage";
import classNames from "classnames";
import { useSetArticleIsCollected} from "@/hooks/article_collections/useArticleCollections";
import {apiClient, apiList} from "@/clientApi";
import {sendCommentReqType} from "@/app/api/protected/article_comments/sendComment/route";
import {
    commentItem,
    getCommentListByArticleIdResType
} from "@/app/api/protected/article_comments/getCommentListByArticleId/route";
import dayjs from "dayjs";
import {delCommentReqType} from "@/app/api/protected/article_comments/delComment/route";

const ReaderPage = () => {
    const articleId =  Number(useParams().articleId);
    const hasInsertedData = useRef(false);
    const [ messageApi, MessageContext ] = useMessage();
    const { isLoading, id: userId } = useAppSelector(state => state.rootReducer.userReducer.value);
    const { isLike, setArticleIsLike  } = useArticleLike();
    const insertArticleReadingRecord = useInsertArticleReadingRecord();
    const scrollContainerRef = React.createRef<HTMLDivElement>();
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const getArticle = useGetArticle();
    const { isCollected, setArticleIsCollected } = useSetArticleIsCollected();
    // 分享
    const onShare = async () => {
        try {
            // 使用 Clipboard API 复制文本
            await navigator.clipboard.writeText(window.location.href);
            messageApi.success('复制成功');
        } catch (err) {
            console.error('复制时出错:', err);
        }
    }
    // 初始化article
    useEffect(() => {
        if(isLoading || !articleId) return;
        getArticle(articleId);
    }, [isLoading, articleId, getArticle])
    // 插入文章阅读数据
    useEffect(() => {
        if (hasInsertedData.current) {
            return; // 如果已经插入过数据，直接退出
        }
        insertArticleReadingRecord(Number(articleId), userId);
        hasInsertedData.current = true;
    }, [articleId, insertArticleReadingRecord, userId]);
    return <>
        <NavLayout>
            {MessageContext}
            <div
                ref={scrollContainerRef}
                className={styles.readerScroll}>
                <div className={styles.readerContainer}>
                    <div className={styles.operator}>
                        <div
                            className={styles.operatorFix}
                        >
                            <OperateButton
                                type='icon-like'
                                isActive={isLike}
                                onClick={() => {
                                    setArticleIsLike(userId, articleId, !isLike);
                                }}
                            />
                            <OperateButton type='icon-pinglun' />
                            <OperateButton
                                type='icon-shoucang'
                                isActive={isCollected}
                                onClick={() => {
                                    setArticleIsCollected(userId, articleId, !isCollected);
                                }}
                            />
                            <OperateButton
                                type='icon-zhuanfa'
                                onClick={onShare}
                            />
                        </div>
                    </div>
                    <div className={styles.centerContent}>
                        <div className={styles.readerContent}>
                            <ReaderHeader title={article.title} authorName={article.authorName} authorId={article.authorId}
                                          draft_id={article.draft_id} views={article.views}
                                          publishTime={article.publishTime}/>
                            <ReactMarkdown
                                components={{
                                    // 给标题添加id，用来做目录的定位
                                    h1: ({children, ...props}: { children: string}) => {
                                        const id = React.Children.toArray(children).join('').replace(/\s/g, '-').toLowerCase();
                                        return <h1 id={id} {...props}>{children}</h1>;
                                    },
                                    h2: ({children, ...props}: { children: string}) => {
                                        const id = React.Children.toArray(children).join('').replace(/\s/g, '-').toLowerCase();
                                        return <h2 id={id} {...props}>{children}</h2>;
                                    },
                                    h3: ({children, ...props}: { children: string}) => {
                                        const id = React.Children.toArray(children).join('').replace(/\s/g, '-').toLowerCase();
                                        return <h3 id={id} {...props}>{children}</h3>;
                                    },
                                    h4: ({children, ...props}: { children: string}) => {
                                        const id = React.Children.toArray(children).join('').replace(/\s/g, '-').toLowerCase();
                                        return <h4 id={id} {...props}>{children}</h4>;
                                    },
                                    h5: ({children, ...props}: { children: string}) => {
                                        const id = React.Children.toArray(children).join('').replace(/\s/g, '-').toLowerCase();
                                        return <h5 id={id} {...props}>{children}</h5>;
                                    },
                                    h6: ({children, ...props}: { children: string}) => {
                                        const id = React.Children.toArray(children).join('').replace(/\s/g, '-').toLowerCase();
                                        return <h6 id={id} {...props}>{children}</h6>;
                                    }
                                }}
                            >{article.content}</ReactMarkdown>
                        </div>
                        <Comments articleId={articleId} />
                    </div>
                    <div className={styles.rightBar}>
                        <AuthorBar
                            authorId={article.authorId}
                        />
                        <OutlineBar scrollContainerRef={scrollContainerRef} markdown={article.content}/>
                    </div>
                </div>
            </div>
        </NavLayout>
    </>
}

type AuthorBarProps = {
    authorId: number;
}
const AuthorBar = (props: AuthorBarProps) => {
    const {authorId} = props;
    const router = useRouter();
    const {authorInfo, getAuthorInfo} = useGetAuthorInfo();
    useEffect(() => {
        if(authorId === 0) return;
        getAuthorInfo(authorId);
    }, [authorId, getAuthorInfo]);
    return <div className={styles.authorBar}>
        <div className={styles.avatar}>
            {authorInfo?.profile && <Image src={authorInfo.profile} width={60} height={60} alt='avatar'/>}
        </div>
        <div className={styles.authorInfo}>
            <div className={styles.nickName}
                 onClick={() => {
                     router.push('/userCenter/' + authorId + '/article');
                 }}
            >{authorInfo?.nick_name}</div>
            <div>{authorInfo?.email}</div>
        </div>
    </div>
}

type OutlineBarProps = {
    markdown: string;
    scrollContainerRef:  React.RefObject<HTMLDivElement>;
}
type nodeType = {
    title: string,
    level: number,
    key: string,
    href: string,
    children: nodeType[],
}
const OutlineBar = (props: OutlineBarProps) => {
    const {markdown, scrollContainerRef} = props;
    const [outline, setOutline] = useState<nodeType[]>([]);
    const [renderAnchor, setRenderAnchor] = useState(false);
    const [outlineOpen, setOutlineOpen] = useState<boolean>(true);
    useEffect(() => {
        setOutline(parseMarkdownOutline(markdown));
    }, [markdown]);

    useEffect(() => {
        if (scrollContainerRef.current) {
            setRenderAnchor(true);
        }
    }, [scrollContainerRef]);
    if(!renderAnchor) return <></>;
    if(outline.length === 0) return <></>;

    return <div className={styles.outlineBarContainer}>
        <div className={styles.outlineHeader}>
            <span>目录</span>
            <span
                className={styles.outlineOpen}
                onClick={() => { setOutlineOpen(!outlineOpen) }}
            >
                {outlineOpen ? '收起' : '展开'}
            </span>
        </div>
        <div
            className={classNames({
                [styles.outlineContent]: true,
                [styles.outlineIsOpen]: outlineOpen,
            })}
        >
            <Anchor
                getContainer={() =>  {
                    if (scrollContainerRef.current) {
                        return scrollContainerRef.current as HTMLDivElement;
                    }
                    return document.body;
                }}
                items={outline}
            />
        </div>
    </div>
}
export default ReaderPage;
function parseMarkdownOutline(markdown: string) {
    const lines = markdown.split('\n');
    const headers = [];

    // 提取所有标题信息
    for (const line of lines) {
        const match = line.match(/^(#+) (.*)$/);
        if (match) {
            const level = match[1].length;
            const title = match[2];
            const key = title.replace(/\s/g, '-').toLowerCase();
            headers.push({level, title, key});
        }
    }

    const tree = [];
    const stack = [];

    // 构建树结构
    for (const header of headers) {
        const node: nodeType = {
            title: header.title,
            level: header.level,
            key: header.key,
            href: '#' + header.key,
            children: []
        };
        while (stack.length > 0 && stack[stack.length - 1].level >= header.level) {
            stack.pop();
        }
        if (stack.length === 0) {
            tree.push(node);
        } else {
            stack[stack.length - 1].children.push(node);
        }
        stack.push(node);
    }
    return tree;
}

const OperateButton = (props: { type: string, isActive?: boolean, onClick?: () => void }) => {
    const { isActive = false, type, onClick } = props;
    const [isHover, setIsHover] = useState(false);
    return <div
        className={styles.Button}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={onClick}
    >
        <IconFont
            type={type}
            style={{ color: iconColors.gray[isActive ? 'active' : (isHover ? 'hover' : 'default')] }}
        />
    </div>
}


const Comments = ({ articleId }: { articleId: number } ) => {
    const [commentList, setCommentList] = useState<commentItem[]>([]);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    // 获取评论列表
    const initCommentList = useCallback(() => {
        apiClient(apiList.post.protected.article_comments.getCommentListByArticleId, {
            method: 'POST',
            body: JSON.stringify({
                article_id: articleId,
            })
        }).then((res: getCommentListByArticleIdResType) => {
            if (res.msg === 'success') setCommentList(res.data);
        })
    }, [articleId]);
    useEffect(() => {
        initCommentList();
    }, [initCommentList]);
    return <div className={styles.comments} >
        <SendComment articleId={articleId} userId={userInfo.id} avatar={userInfo.profile ?? ''} initCommentList={initCommentList}/>
        <CommentsList articleId={articleId} commentList={commentList} userId={userInfo.id} initCommentList={initCommentList} />
    </div>
}

const SendComment = ({ articleId, parentCommentId, avatar, userId, initCommentList }: { articleId: number, parentCommentId?: number, avatar: string, userId: number, initCommentList: () => void }) => {
    return <div className={styles.sendComments}>
        <div className={styles.title}>评论</div>
        <div className={styles.Input}>
            <div className={styles.avatar}>
                {avatar && <Image src={avatar} alt={''} width={60} height={60}/>}
            </div>
            <SendCommentInput articleId={articleId} parentCommentId={parentCommentId} userId={userId} onSendComment={initCommentList} />
        </div>
    </div>
}

const SendCommentInput = (props: { userId: number, articleId: number, autoFocus?: boolean, parentCommentId?: number, onSendComment?: () => void, onFocus?: () => void, onBlur?: () => void }) => {
    const { userId, parentCommentId, articleId, onSendComment, onFocus, onBlur, autoFocus = false } = props;
    const [commentText, setCommentText] = useState('');
    const [messageApi, contextHandle] = useMessage();
    const [isFocus, setIsFocus] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const sendComment = () => {
        setIsLoading(true);
        const apiData: sendCommentReqType = {
            userId,
            articleId,
            parentCommentId,
            commentText,
        }
        apiClient(apiList.post.protected.article_comments.sendArticleComment, {
            method: 'POST',
            body: JSON.stringify(apiData)
        }).then(res => {
            if(res.msg === 'success') {
                messageApi.success('评论成功');
            } else {
                messageApi.error('评论失败');
            }
            // 清除评论内容
            setCommentText('');
            // 评论回调触发
            if(onSendComment) onSendComment();
            setIsLoading(false);
        })
    }
    return <div className={styles.sendInput}>
        {contextHandle}
        <div
            className={classNames({
                [styles.sendContainer]: true,
                [styles.isFocus]: isFocus,
            })}
        >
            <Input.TextArea
                value={commentText}
                maxLength={100}
                autoFocus={autoFocus}
                onFocus={() => {
                    setIsFocus(true);
                    if (onFocus) onFocus();
                }}
                onBlur={() => {
                    setIsFocus(false);
                    if (onBlur) onBlur();
                }}
                style={{height: 80, resize: 'none'}}
                placeholder={'发表评论'}
                onChange={(e) => {
                    setCommentText(e.target.value);
                }}
            />
            <div
                className={styles.bottom}
            >
                <span className={styles.count}>{commentText.length + '/100'}</span>
                <Button
                    type="primary"
                    disabled={commentText.length === 0 || isLoading}
                    onClick={sendComment}
                    loading={isLoading}
                >
                    发送
                </Button>
            </div>
        </div>
    </div>
}

const CommentsList = ({ commentList, articleId, userId, initCommentList }: { commentList: commentItem[], articleId: number, userId: number, initCommentList: () => void }) => {

    return <div className={styles.commentsList}>
        {
            commentList.map(topLevelComment => {
                const flatComments = flattenComments(topLevelComment);
                return <div key={topLevelComment.comment_id} className={styles.topCommentContainer}>
                    <Comment userId={userId} comment={topLevelComment} articleId={articleId} initCommentList={initCommentList}/>
                    <div className={styles.childCommentContainer}>
                        {flatComments.map(childComment => {
                            return <Comment
                                userId={userId}
                                key={childComment.comment_id}
                                comment={childComment}
                                topLevelCommentId={topLevelComment.comment_id}
                                articleId={articleId}
                                initCommentList={initCommentList}
                            />
                            })}
                        </div>
                    </div>
                }
            )}
    </div>
}


const Comment = ({userId, articleId, comment, topLevelCommentId, initCommentList}: {
    userId: number,
    articleId: number,
    comment: commentItem,
    topLevelCommentId?: number
    initCommentList:  () => void
}) => {
    const [showReply, setShowReply] = useState(false);
    const delComment = () => {
        const apiData: delCommentReqType = {
            comment_id: comment.comment_id
        }
        apiClient(apiList.post.protected.article_comments.delComment, {
            method: 'POST',
            body: JSON.stringify(apiData)
        }).then(() => {
            initCommentList();
        });
    }
    return (
        <div className={styles.commentItem}>
            <div className={styles.left}>
                {comment.userInfo.avatar &&
                    <Image src={comment.userInfo.avatar} alt={''} width={40} height={40}/>}
            </div>
            <div className={styles.right}>
                {
                    topLevelCommentId
                        ?
                        // 子评论
                        (
                            comment.replyComment && comment.replyComment.id !== topLevelCommentId
                                ?
                                // 子评论的子评论
                                <>
                                    <span>
                                        <span className={styles.nickName}>{comment.userInfo.nickname}</span>
                                        回复
                                        <span className={styles.nickName}>{comment.replyComment.userInfo.nickname}：</span>
                                    </span>
                                    <span className={styles.commentText}>{comment.comment_text}</span>
                                </>
                                :
                                // 顶级评论的子评论
                                <>
                                    <span className={styles.nickName}>{comment.userInfo.nickname}：</span>
                                    <span className={styles.commentText}>{comment.comment_text}</span>
                                </>
                        )
                        :
                        // 顶级评论
                        (
                            <>
                            <div className={styles.nickName}>{comment.userInfo.nickname}</div>
                                <div className={styles.commentText}>{comment.comment_text}</div>
                            </>
                        )
                }
                <div className={styles.commentBottom}>
                    <span>{dayjs(comment.created_at).format('YYYY-MM-DD')}</span>
                    <span className={styles.commentButton} onClick={() => { setShowReply(!showReply) }} >{!showReply ? '回复' : '取消回复'}</span>
                    {userId === comment.user_id
                        &&
                        <Popconfirm
                            title={'确定删除这条评论吗？'}
                            onConfirm={delComment}
                        >
                            <span className={styles.commentButton}>删除</span>
                        </Popconfirm>
                    }
                </div>
                {
                    showReply && (
                        <div style={{marginTop: '10px'}}>
                            <SendCommentInput
                                userId={userId}
                                articleId={articleId}
                                autoFocus={true}
                                parentCommentId={comment.comment_id}
                                onSendComment={() => {
                                    initCommentList();
                                    setShowReply(false);
                                }}
                            />
                        </div>
                    )
                }
            </div>
        </div>
    );
};

// 递归函数，用于拍平评论
const flattenComments = (topComment: commentItem, flatComments: commentItem[] = []) => {
    topComment.children.forEach(child => {
        flatComments.push(child);
        flattenComments(child, flatComments);
    });
    return flatComments;
};
