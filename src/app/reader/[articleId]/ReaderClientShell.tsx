'use client'

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {Anchor, Button, Input, Popconfirm} from 'antd';
import useMessage from 'antd/es/message/useMessage';
import classNames from 'classnames';
import dayjs from 'dayjs';
import {useDispatch} from 'react-redux';
import {apiClient} from '@/clientApi';
import {iconColors, IconFont} from '@/components/IconFont';
import {useInsertArticleReadingRecord} from '@/hooks/article_reading_records/useArticleReadingRecords';
import {useSetArticleIsCollected} from '@/hooks/article_collections/useArticleCollections';
import {useArticleLike} from '@/hooks/articles/useArticles';
import {useGetAuthorInfo} from '@/hooks/users/useUsers';
import {AppDispatch, useAppSelector} from '@/store';
import {setArticle} from '@/store/features/articleSlice';
import type {commentItem, SendCommentRequest} from '@/shared/api/article_comments';
import type {ApiResponse} from '@/shared/api/response';
import styles from './index.module.scss';

type ReaderClientShellProps = {
    articleId: number;
    authorId: number;
    markdown: string;
    children: React.ReactNode;
    isPreview?: boolean;
};

const ReaderClientShell = (props: ReaderClientShellProps) => {
    const {articleId, authorId, markdown, children, isPreview = false} = props;
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const hasInsertedData = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [messageApi, messageContext] = useMessage();
    const {isLoading, id: userId, login} = useAppSelector(state => state.rootReducer.userReducer.value);
    const {isLike, setArticleIsLike} = useArticleLike();
    const {isCollected, setArticleIsCollected} = useSetArticleIsCollected();
    const insertArticleReadingRecord = useInsertArticleReadingRecord();
    const [showRightBar, setShowRightBar] = useState(false);

    useEffect(() => {
        dispatch(setArticle({articleId, authorId, content: markdown}));
    }, [articleId, authorId, dispatch, markdown]);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 769px)');
        const syncShowRightBar = () => setShowRightBar(mediaQuery.matches);
        syncShowRightBar();
        mediaQuery.addEventListener('change', syncShowRightBar);
        return () => mediaQuery.removeEventListener('change', syncShowRightBar);
    }, []);

    useEffect(() => {
        if (isPreview || hasInsertedData.current || isLoading || !articleId || !userId) return;
        void insertArticleReadingRecord(articleId, userId);
        hasInsertedData.current = true;
    }, [articleId, insertArticleReadingRecord, isLoading, isPreview, userId]);

    const requireLogin = useCallback(() => {
        if (login) return true;
        messageApi.warning('请先登录');
        window.setTimeout(() => {
            router.push('/login');
        }, 800);
        return false;
    }, [login, messageApi, router]);

    const onShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            messageApi.success('复制成功');
        } catch (error) {
            console.error('复制时出错:', error);
        }
    };

    return <>
        {messageContext}
        <div ref={scrollContainerRef} className={styles.readerScroll}>
            <div className={classNames(styles.readerContainer, {[styles.previewContainer]: isPreview})}>
                {!isPreview && <div className={styles.operator}>
                    <div className={styles.operatorFix}>
                        <OperateButton
                            type="icon-like"
                            isActive={isLike}
                            onClick={() => {
                                if (!requireLogin()) return;
                                setArticleIsLike(userId, articleId, !isLike);
                            }}
                        />
                        <OperateButton type="icon-pinglun" />
                        <OperateButton
                            type="icon-shoucang"
                            isActive={isCollected}
                            onClick={() => {
                                if (!requireLogin()) return;
                                setArticleIsCollected(userId, articleId, !isCollected);
                            }}
                        />
                        <OperateButton type="icon-zhuanfa" onClick={onShare} />
                    </div>
                </div>}
                <div className={styles.centerContent}>
                    {children}
                    {!isPreview && <Comments articleId={articleId} />}
                </div>
                {showRightBar && <div className={styles.rightBar}>
                    <AuthorBar authorId={authorId} />
                    <OutlineBar scrollContainerRef={scrollContainerRef} markdown={markdown} />
                </div>}
            </div>
        </div>
    </>;
};

type AuthorBarProps = {
    authorId: number;
};

const AuthorBar = (props: AuthorBarProps) => {
    const {authorId} = props;
    const router = useRouter();
    const {authorInfo, getAuthorInfo} = useGetAuthorInfo();

    useEffect(() => {
        if (authorId === 0) return;
        getAuthorInfo(authorId);
    }, [authorId, getAuthorInfo]);

    return <div className={styles.authorBar}>
        <div className={styles.avatar}>
            {authorInfo?.profile && <Image src={authorInfo.profile} width={60} height={60} alt="avatar" />}
        </div>
        <div className={styles.authorInfo}>
            <div className={styles.nickName} onClick={() => router.push(`/userCenter/${authorId}/article`)}>{authorInfo?.nick_name}</div>
            <div>{authorInfo?.email}</div>
        </div>
    </div>;
};

type OutlineBarProps = {
    markdown: string;
    scrollContainerRef: React.RefObject<HTMLDivElement>;
};

type OutlineNode = {
    title: string;
    level: number;
    key: string;
    href: string;
    children: OutlineNode[];
};

const OutlineBar = (props: OutlineBarProps) => {
    const {markdown, scrollContainerRef} = props;
    const [outline, setOutline] = useState<OutlineNode[]>([]);
    const [renderAnchor, setRenderAnchor] = useState(false);
    const [outlineOpen, setOutlineOpen] = useState(true);

    useEffect(() => {
        setOutline(parseMarkdownOutline(markdown));
    }, [markdown]);

    useEffect(() => {
        if (scrollContainerRef.current) setRenderAnchor(true);
    }, [scrollContainerRef]);

    if (!renderAnchor || outline.length === 0) return null;

    const scrollToHeading = (event: React.MouseEvent<HTMLElement>, href?: string) => {
        if (!href || !href.startsWith('#')) return;
        const scrollContainer = scrollContainerRef.current;
        const target = document.getElementById(href.slice(1));
        if (!scrollContainer || !target) return;

        event.preventDefault();
        const containerRect = scrollContainer.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        scrollContainer.scrollTo({
            top: scrollContainer.scrollTop + targetRect.top - containerRect.top - 16,
            behavior: 'smooth',
        });
        window.history.replaceState(null, '', href);
    };

    return <div className={styles.outlineBarContainer}>
        <div className={styles.outlineHeader}>
            <span>目录</span>
            <span className={styles.outlineOpen} onClick={() => setOutlineOpen(!outlineOpen)}>
                {outlineOpen ? '收起' : '展开'}
            </span>
        </div>
        <div className={classNames(styles.outlineContent, {
            [styles.outlineIsOpen]: outlineOpen,
        })}>
            <Anchor
                onClick={(event, link) => scrollToHeading(event, link.href)}
                getContainer={() => scrollContainerRef.current ?? document.body}
                items={outline}
            />
        </div>
    </div>;
};

function parseMarkdownOutline(markdown: string) {
    const lines = markdown.split('\n');
    const headers: Pick<OutlineNode, 'level' | 'title' | 'key'>[] = [];
    let codeFence: { marker: '`' | '~'; length: number } | null = null;

    for (const line of lines) {
        const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})/);
        if (fenceMatch) {
            const marker = fenceMatch[1][0] as '`' | '~';
            const length = fenceMatch[1].length;

            if (!codeFence) codeFence = {marker, length};
            else if (codeFence.marker === marker && length >= codeFence.length) codeFence = null;
            continue;
        }

        if (codeFence) continue;

        const match = line.match(/^(#+) (.*)$/);
        if (match) {
            const level = match[1].length;
            const title = match[2];
            const key = title.replace(/\s/g, '-').toLowerCase();
            headers.push({level, title, key});
        }
    }

    const tree: OutlineNode[] = [];
    const stack: OutlineNode[] = [];

    for (const header of headers) {
        const node: OutlineNode = {
            title: header.title,
            level: header.level,
            key: header.key,
            href: `#${header.key}`,
            children: [],
        };
        while (stack.length > 0 && stack[stack.length - 1].level >= header.level) stack.pop();
        if (stack.length === 0) tree.push(node);
        else stack[stack.length - 1].children.push(node);
        stack.push(node);
    }
    return tree;
}

const OperateButton = (props: { type: string; isActive?: boolean; onClick?: () => void }) => {
    const {isActive = false, type, onClick} = props;
    const [isHover, setIsHover] = useState(false);
    return <div
        className={styles.Button}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={onClick}
    >
        <IconFont
            type={type}
            style={{color: iconColors.gray[isActive ? 'active' : (isHover ? 'hover' : 'default')]}}
        />
    </div>;
};

const Comments = ({articleId}: { articleId: number }) => {
    const [commentList, setCommentList] = useState<commentItem[]>([]);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);

    const initCommentList = useCallback(() => {
        apiClient(`articles/${articleId}/comments`).then((res: ApiResponse<commentItem[]>) => {
            if (res.ok) setCommentList(res.data);
        });
    }, [articleId]);

    useEffect(() => {
        initCommentList();
    }, [initCommentList]);

    return <div className={styles.comments}>
        <SendComment articleId={articleId} userId={userInfo.id} avatar={userInfo.profile ?? ''} disabled={!userInfo.login} initCommentList={initCommentList} />
        <CommentsList articleId={articleId} commentList={commentList} userId={userInfo.id} initCommentList={initCommentList} />
    </div>;
};

const SendComment = ({articleId, parentCommentId, avatar, userId, disabled = false, initCommentList}: { articleId: number; parentCommentId?: number; avatar: string; userId: number; disabled?: boolean; initCommentList: () => void }) => {
    return <div className={styles.sendComments}>
        <div className={styles.title}>评论</div>
        <div className={styles.Input}>
            <div className={styles.avatar}>
                {avatar && <Image src={avatar} alt="" width={60} height={60} />}
            </div>
            <SendCommentInput articleId={articleId} parentCommentId={parentCommentId} userId={userId} disabled={disabled} onSendComment={initCommentList} />
        </div>
    </div>;
};

const SendCommentInput = (props: { userId: number; articleId: number; autoFocus?: boolean; disabled?: boolean; parentCommentId?: number; onSendComment?: () => void; onFocus?: () => void; onBlur?: () => void }) => {
    const {parentCommentId, articleId, onSendComment, onFocus, onBlur, autoFocus = false, disabled = false} = props;
    const [commentText, setCommentText] = useState('');
    const [messageApi, contextHandle] = useMessage();
    const [isFocus, setIsFocus] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const sendComment = () => {
        if (disabled) return;
        setIsLoading(true);
        const apiData: SendCommentRequest = {
            commentText,
            parentCommentId,
        };
        apiClient(`articles/${articleId}/comments`, {
            method: 'POST',
            body: JSON.stringify(apiData),
        }).then((res: ApiResponse<unknown>) => {
            if (res.ok) messageApi.success('评论成功');
            else messageApi.error('评论失败');
            setCommentText('');
            onSendComment?.();
            setIsLoading(false);
        });
    };

    return <div className={styles.sendInput}>
        {contextHandle}
        <div className={classNames(styles.sendContainer, {
            [styles.isFocus]: isFocus,
        })}>
            <Input.TextArea
                value={commentText}
                maxLength={100}
                autoFocus={autoFocus}
                disabled={disabled}
                onFocus={() => {
                    setIsFocus(true);
                    onFocus?.();
                }}
                onBlur={() => {
                    setIsFocus(false);
                    onBlur?.();
                }}
                style={{height: 80, resize: 'none'}}
                placeholder={disabled ? '登录后发表评论' : '发表评论'}
                onChange={(event) => setCommentText(event.target.value)}
            />
            <div className={styles.bottom}>
                <span className={styles.count}>{`${commentText.length}/100`}</span>
                <Button
                    type="primary"
                    disabled={disabled || commentText.length === 0 || isLoading}
                    onClick={sendComment}
                    loading={isLoading}
                >
                    发送
                </Button>
            </div>
        </div>
    </div>;
};

const CommentsList = ({commentList, articleId, userId, initCommentList}: { commentList: commentItem[]; articleId: number; userId: number; initCommentList: () => void }) => {
    return <div className={styles.commentsList}>
        {commentList.map(topLevelComment => {
            const flatComments = flattenComments(topLevelComment);
            return <div key={topLevelComment.comment_id} className={styles.topCommentContainer}>
                <Comment userId={userId} comment={topLevelComment} articleId={articleId} initCommentList={initCommentList} />
                <div className={styles.childCommentContainer}>
                    {flatComments.map(childComment => <Comment
                        userId={userId}
                        key={childComment.comment_id}
                        comment={childComment}
                        topLevelCommentId={topLevelComment.comment_id}
                        articleId={articleId}
                        initCommentList={initCommentList}
                    />)}
                </div>
            </div>;
        })}
    </div>;
};

const Comment = ({userId, articleId, comment, topLevelCommentId, initCommentList}: {
    userId: number;
    articleId: number;
    comment: commentItem;
    topLevelCommentId?: number;
    initCommentList: () => void;
}) => {
    const [showReply, setShowReply] = useState(false);

    const delComment = () => {
        apiClient(`articles/${articleId}/comments/${comment.comment_id}`, {
            method: 'DELETE',
        }).then(() => {
            initCommentList();
        });
    };

    return <div className={styles.commentItem}>
        <div className={styles.left}>
            {comment.userInfo.avatar && <Image src={comment.userInfo.avatar} alt="" width={40} height={40} />}
        </div>
        <div className={styles.right}>
            {topLevelCommentId
                ? comment.replyComment && comment.replyComment.id !== topLevelCommentId
                    ? <>
                        <span>
                            <span className={styles.nickName}>{comment.userInfo.nickname}</span>
                            回复
                            <span className={styles.nickName}>{comment.replyComment.userInfo.nickname}：</span>
                        </span>
                        <span className={styles.commentText}>{comment.comment_text}</span>
                    </>
                    : <>
                        <span className={styles.nickName}>{comment.userInfo.nickname}：</span>
                        <span className={styles.commentText}>{comment.comment_text}</span>
                    </>
                : <>
                    <div className={styles.nickName}>{comment.userInfo.nickname}</div>
                    <div className={styles.commentText}>{comment.comment_text}</div>
                </>}
            <div className={styles.commentBottom}>
                <span>{dayjs(comment.created_at).format('YYYY-MM-DD')}</span>
                <span className={styles.commentButton} onClick={() => setShowReply(!showReply)}>{!showReply ? '回复' : '取消回复'}</span>
                {userId === comment.user_id && <Popconfirm title="确定删除这条评论吗？" onConfirm={delComment}>
                    <span className={styles.commentButton}>删除</span>
                </Popconfirm>}
            </div>
            {showReply && <div style={{marginTop: '10px'}}>
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
            </div>}
        </div>
    </div>;
};

const flattenComments = (comment: commentItem): commentItem[] => {
    const children = comment.children || [];
    return children.reduce<commentItem[]>((result, child) => {
        result.push(child);
        result.push(...flattenComments(child));
        return result;
    }, []);
};

export const ReaderEditLink = ({authorId, draftId}: { authorId: number; draftId?: number }) => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const isOwn = userInfo.id === authorId;
    if (!isOwn || !draftId) return null;
    return <span className={styles.headerEdit} onClick={() => window.open(`/editor/draft/v2/${draftId}`, '_blank')}>编辑</span>;
};

export default ReaderClientShell;
