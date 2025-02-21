"use client"
import {useParams, useRouter} from "next/navigation";
import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {setArticle} from "@/store/features/articleSlice";
import {useCallback, useEffect} from "react";
import {useGetArticle} from "@/hooks/articles/useArticles";
import ReaderHeader from "@/components/ReaderHeader";
import NavLayout from "@/components/NavLayout";
import ReactMarkdown from "@/components/ReactMarkdown";
import styles from './index.module.scss';
import Image from "next/image";
import {useGetAuthorInfo, useGetUserInfo} from "@/hooks/users/useUsers";

const ReaderPage = () => {
    const { articleId } =  useParams();
    const article = useAppSelector(state => state.rootReducer.articleReducer.value);
    const getArticle = useGetArticle();
    const dispatch = useDispatch<AppDispatch>();
    // 初始化article
    const initArticle = useCallback(() => {
        const id = articleId === 'new' ? articleId : Number(articleId);
        dispatch(setArticle({
            ...article,
            articleId: id
        }))
        if(typeof id === 'number')
            getArticle(id);
    }, [articleId]);
    useEffect(() => {
        initArticle();
    }, [initArticle])
    return <>
        <NavLayout>
            <div className={styles.readerContainer}>
                <div className={styles.operator}>
                    <div
                        className={styles.operatorFix}
                    ></div>
                </div>
                <div className={styles.readerContent}>
                    <ReaderHeader title={article.title} authorName={article.authorName} authorId={article.authorId} draft_id={article.draft_id} views={article.views} publishTime={article.publishTime} />
                    <ReactMarkdown>{article.content}</ReactMarkdown>
                </div>
                <div className={styles.rightBar}>
                    <AuthorBar
                        authorId={article.authorId}
                    />
                </div>
            </div>
        </NavLayout>
    </>
}

type AuthorBarProps = {
    authorId: number;
}
const AuthorBar = (props: AuthorBarProps) => {
    const { authorId } = props;
    const router = useRouter();
    const { authorInfo, getAuthorInfo } = useGetAuthorInfo();
    useEffect(() => {
        getAuthorInfo(authorId);
    }, [authorId]);
    return <div className={styles.authorBar}>
        <div className={styles.avatar}>
            {authorInfo.profile && <Image src={authorInfo.profile} width={60} height={60} alt='avatar' />}
        </div>
        <div className={styles.authorInfo}>
            <div className={styles.nickName}
                onClick={() => {
                    router.push('/profile/' + authorId);
                }}
            >{authorInfo.nick_name}</div>
            <div>{authorInfo.email}</div>
        </div>
    </div>
}
const OutlineBar = () => {
    return <></>
}
export default ReaderPage;