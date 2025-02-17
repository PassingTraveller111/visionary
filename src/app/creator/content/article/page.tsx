"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import { useEffect } from "react";
import Image from "next/image";
import moment from "moment";
import {Dropdown, MenuProps, Modal, message} from "antd";
import moreIcon from '../../../../../public/icon/more.svg';
import {useDelArticle, useGetArticleList} from "@/hooks/articles/useArticles";
import {HookAPI} from "antd/es/modal/useModal";
import {MessageInstance} from "antd/es/message/interface";
import {useAppSelector} from "@/store";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";



const ArticlePage = () => {
    const { id: userId } = useAppSelector(state => state.rootReducer.userReducer.value);
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();
    const { articleList, getArticleList } = useGetArticleList();
    useEffect(() => {
        getArticleList(Number(userId));
    }, [userId]);
    return <>
        {modalContextHolder}
        {messageContextHolder}
        <NavLayout>
            <CreatorSideBarLayout>
                <div className={styles['container']}>
                    <div className={styles['articleList-container']}>
                        {articleList.map((article) => {
                            return <div key={article.id} className={styles['articleList-item']}
                                        onClick={() => {
                                            window.open('/reader/' + article.id);
                                        }}
                            >
                                <div>
                                    <div className={styles['article-title']}>{article.title}</div>
                                    <div
                                        className={styles['article-date']}>{moment(article.updated_time).format('YYYY-MM-DD HH:mm')}</div>
                                </div>
                                <div className={styles['article-menu']} onClick={(e) => {
                                    e.stopPropagation()
                                }}>
                                    <ArticleItemMenu messageApi={messageApi} modalApi={modalApi} articleId={article.id}
                                                     getArticleList={getArticleList} userId={Number(userId)}/>
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
    modalApi: HookAPI,
    messageApi: MessageInstance,
    getArticleList: (userId: number) => void,
    userId: number
}) => {
    const {articleId, modalApi, messageApi, getArticleList, userId} = props;
    const delArticle = useDelArticle();
    const items: MenuProps['items'] = [
        {
            key: 'edit',
            label: (
                <span onClick={() => {
                    window.open('/editor/' + props.articleId);
                }}>编辑</span>
            ),
        },
        {
            key: '2',
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
    return <>
        <Dropdown menu={{items}}>
            <Image src={moreIcon} alt='更多' width={30} height={30} />
        </Dropdown>
    </>
}

export default ArticlePage;