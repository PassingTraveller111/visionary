"use client"
import {useParams, useRouter} from "next/navigation";
import { useAppSelector } from "@/store";
import React, { useEffect, useState } from "react";
import {useArticleLike, useGetArticle} from "@/hooks/articles/useArticles";
import ReaderHeader from "@/components/ReaderHeader";
import NavLayout from "@/components/NavLayout";
import ReactMarkdown from "@/components/ReactMarkdown";
import styles from './index.module.scss';
import Image from "next/image";
import {useGetAuthorInfo} from "@/hooks/users/useUsers";
import { Anchor } from "antd";
import {iconColors, IconFont} from "@/components/IconFont";

const ReaderPage = () => {
    const { articleId } =  useParams();
    const { isLoading, id: userId } = useAppSelector(state => state.rootReducer.userReducer.value);
    const { getArticleIsLike, isLike, setArticleIsLike  } = useArticleLike();
    const scrollContainerRef = React.createRef<HTMLDivElement>();
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const getArticle = useGetArticle();
    // 初始化article
    useEffect(() => {
        if(isLoading || !articleId) return;
        const id = Number(articleId);
        getArticle(id)
    }, [isLoading, articleId, getArticle])
    useEffect(() => {
        getArticleIsLike(userId, Number(articleId));
    }, [articleId, getArticleIsLike, userId]);
    return <>
        <NavLayout>
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
                                    setArticleIsLike(userId, Number(articleId), !isLike);
                                }}
                            />
                            <OperateButton type='icon-pinglun' isActive={false} />
                            <OperateButton type='icon-shoucang' isActive={false} />
                            <OperateButton type='icon-zhuanfa' isActive={false} />
                        </div>
                    </div>
                    <div className={styles.readerContent}>
                        <ReaderHeader title={article.title} authorName={article.authorName} authorId={article.authorId}
                                      draft_id={article.draft_id} views={article.views}
                                      publishTime={article.publishTime}/>
                        <ReactMarkdown
                            components={{
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
    }, [authorId]);
    return <div className={styles.authorBar}>
        <div className={styles.avatar}>
            {authorInfo?.profile && <Image src={authorInfo.profile} width={60} height={60} alt='avatar'/>}
        </div>
        <div className={styles.authorInfo}>
            <div className={styles.nickName}
                 onClick={() => {
                     router.push('/profile/' + authorId);
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
            className={styles.outlineContent}
            style={{
                maxHeight: outlineOpen ? '400px' : '0px',
                borderTop: outlineOpen ? '1px solid #ccc' : 'none',
            }}
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

const OperateButton = (props: { type: string, isActive: boolean, onClick?: () => void }) => {
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
            style={{ color: iconColors[isActive ? 'active' : (isHover ? 'hover' : 'default')] }}
        />
    </div>
}