"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import { useEffect } from "react";
import {MenuProps, Modal, message, Empty} from "antd";
import {useDelArticle, useGetArticleList} from "@/hooks/articles/useArticles";
import {useAppSelector} from "@/store";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import CreatorList from "@/components/CreatorList";
import ArticleItem from "@/components/ArticleItem";



const ArticlePage = () => {
    const { id: userId, isLoading } = useAppSelector(state => state.rootReducer.userReducer.value);
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();
    const { articleList, getArticleList } = useGetArticleList();
    const delArticle = useDelArticle();

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
                <CreatorList
                    NavLeftContent={'文章管理'}
                    ListContent={
                        <div className={styles['articleList-container']}>
                            {articleList.length <= 0 && <Empty/>}
                            {articleList.map((article) => {
                                const items: MenuProps['items'] = [
                                    {
                                        key: 'edit',
                                        label: (
                                            <span onClick={() => {
                                                window.open('/editor/draft/' + article.draft_id);
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
                                                    delArticle(article.id).then(res => {
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
                                if (article.review_status !== 'already_review') {
                                    items.push({
                                        key: 'lookReview',
                                        label: (
                                            <span
                                                onClick={() => {
                                                    window.open('/reader/review/' + article.review_id)
                                                }}
                                            >查看审核稿</span>
                                        )
                                    })
                                }
                                return <ArticleItem
                                    status={article.review_status}
                                    key={article.id}
                                    title={article.title}
                                    articleId={article.id}
                                    updateTime={article.updated_time}
                                    operateMenuItems={items}
                                />
                            })}
                        </div>
                    }
                />
            </CreatorSideBarLayout>
        </NavLayout>
    </>
}






export default ArticlePage;

