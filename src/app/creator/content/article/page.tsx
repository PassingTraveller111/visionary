"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import { useEffect } from "react";
import Image from "next/image";
import moment from "moment";
import {Dropdown, MenuProps, Modal, message, Tag, Empty} from "antd";
import moreIcon from '../../../../../public/icon/more.svg';
import {useDelArticle, useGetArticleList} from "@/hooks/articles/useArticles";
import {HookAPI} from "antd/es/modal/useModal";
import {MessageInstance} from "antd/es/message/interface";
import {useAppSelector} from "@/store";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import {reviewStatusType} from "@/store/features/articleSlice";



const ArticlePage = () => {
    const { id: userId, isLoading } = useAppSelector(state => state.rootReducer.userReducer.value);
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();
    const { articleList, getArticleList } = useGetArticleList();
    useEffect(() => {
        if(isLoading) return;
        getArticleList(userId);
    }, [getArticleList, userId, isLoading]);
    return <>
        {modalContextHolder}
        {messageContextHolder}
        <NavLayout>
            <CreatorSideBarLayout
                selectedMenuKey='article'
            >
                <div className={styles['container']}>
                    <div className={styles['articleList-container']}>
                        {articleList.length <= 0 && <Empty/>}
                        {articleList.map((article) => {
                            return <div key={article.id} className={styles['articleList-item']}
                                        onClick={() => {
                                            window.open('/reader/' + article.id);
                                        }}
                            >
                                <div>
                                    <div className={styles['article-title']}>
                                        {article.title}
                                        <ArticleStatus status={article.review_status} />
                                    </div>
                                    <div
                                        className={styles['article-date']}>{moment(article.updated_time).format('YYYY-MM-DD HH:mm')}</div>
                                </div>
                                <div className={styles['article-menu']} onClick={(e) => {
                                    e.stopPropagation()
                                }}>
                                    <ArticleItemMenu
                                        messageApi={messageApi}
                                        modalApi={modalApi}
                                        articleId={article.id}
                                        draft_id={article.draft_id}
                                        getArticleList={getArticleList}
                                        userId={Number(userId)}
                                        review_id={article.review_id}
                                        review_status={article.review_status}
                                    />
                                </div>
                            </div>
                        })}
                    </div>
                </div>
            </CreatorSideBarLayout>
        </NavLayout>
    </>
}


const ArticleItemMenu = (props: {
    articleId: number,
    draft_id?: number,
    review_id?: number,
    modalApi: HookAPI,
    messageApi: MessageInstance,
    getArticleList: (userId: number) => void,
    userId: number;
    review_status: reviewStatusType;
}) => {
    const {articleId, modalApi, messageApi, getArticleList, userId, draft_id, review_id, review_status} = props;
    const delArticle = useDelArticle();
    const items: MenuProps['items'] = [
        {
            key: 'edit',
            label: (
                <span onClick={() => {
                    window.open('/editor/draft/' + draft_id);
                }}>编辑</span>
            ),
        },
        {
            key: 'del',
            label: (
                <span onClick={async (e) => {
                    e.stopPropagation();
                    const confirm = await modalApi.confirm({
                        title: '删除',
                        content: <span>确定要删除吗</span>,
                        okText: '确定',
                        cancelText: '取消',
                    });
                    if (confirm) {
                        delArticle(articleId).then(res => {
                            if (res.msg === 'success') {
                                messageApi.success('删除成功');
                            } else {
                                messageApi.error('删除失败');
                            }
                            getArticleList(userId);
                        })
                    }
                }}>
                    删除
                </span>
            ),
        },
    ];
    if (review_status !== 'already_review') {
        items.push({
            key: 'lookReview',
            label: (
                <span
                    onClick={() => {
                        window.open('/reader/review/' + review_id)
                    }}
                >查看审核稿</span>
            )
        })
    }
    return <>
        <Dropdown menu={{items}}>
            <Image src={moreIcon} alt='更多' width={30} height={30} />
        </Dropdown>
    </>
}


const ArticleStatus = (props: { status: reviewStatusType }) => {
    const { status } = props;
    switch (status) {
        case "already_review": {
            return <></>;
        }
        case "pending_review": {
            return <Tag color='yellow'>审核中</Tag>
        }
        case "failed_review": {
            return <Tag color='red'>审核失败</Tag>
        }
    }
}

export default ArticlePage;

