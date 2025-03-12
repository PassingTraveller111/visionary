'use client'
import UserCenterLayOut from "../../../../components/UserCenterLayout";
import styles from './index.module.scss';
import {useArticleCollections, useSetArticleIsCollected} from "@/hooks/article_collections/useArticleCollections";
import ArticleItem from "@/components/ArticleItem";
import {MenuProps} from "antd";
import {useIsUserOwn} from "@/hooks/users/useUsers";
import {useParams, useRouter} from "next/navigation";
import {useMemo} from "react";
import useMessage from "antd/es/message/useMessage";

const CollectPage = () => {
    const { collectionList, getArticleCollections } = useArticleCollections();
    const [ messageApi, messageContext ] = useMessage();
    const router = useRouter();
    const { setArticleIsCollected } = useSetArticleIsCollected();
    const userId = Number(useParams().userId); // 该用户空间的用户id
    const isOwnFn = useIsUserOwn();
    const isOwn = useMemo(() => isOwnFn(userId), [isOwnFn, userId]);
    return <UserCenterLayOut>
        {messageContext}
        <div
            className={styles.collectContainer}
        >
            <div>
                {collectionList.map(item => {
                    const items: MenuProps['items'] = isOwn ? [
                            {
                                key: 'del',
                                label: <span>删除</span>,
                                onClick: () => {
                                    setArticleIsCollected(userId, item.article_id, false).then(() => {
                                        messageApi.success('删除成功');
                                        getArticleCollections(userId);
                                    })
                                }
                            },
                            {
                                key: 'open',
                                label: <span>打开</span>,
                                onClick: () => {
                                    router.push('/reader/' + item.article_id);
                                }
                            }
                        ] : [];
                    return <ArticleItem
                        key={item.article_id}
                        title={item.title}
                        summary={item.summary}
                        articleId={item.article_id}
                        author={item.author_name}
                        likes_count={item.like_count}
                        looks_count={item.look_count}
                        tags={item.tags}
                        operateMenuItems={items}
                    />
                })}
            </div>
        </div>
    </UserCenterLayOut>
}

export default CollectPage;