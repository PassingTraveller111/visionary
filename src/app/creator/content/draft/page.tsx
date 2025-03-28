"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import { useEffect } from "react";
import {MenuProps, Modal, message, Empty} from "antd";
import {useAppSelector} from "@/store";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import {useDeleteDraft, useGetDraftList} from "@/hooks/drafts/useDrafts";
import ArticleItem from "@/components/ArticleItem";
import CreatorList from "@/components/CreatorList";



const DraftPage = () => {
    const { id: userId } = useAppSelector(state => state.rootReducer.userReducer.value);
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();
    const { draftList, getDraftList } = useGetDraftList();
    const delDraft = useDeleteDraft();
    useEffect(() => {
        getDraftList(userId);
    }, [getDraftList, userId]);
    return <>
        {modalContextHolder}
        {messageContextHolder}
        <NavLayout>
            <CreatorSideBarLayout
                selectedMenuKey='draft'
            >
                <CreatorList
                    NavLeftContent={'草稿管理'}
                    ListContent={
                        <div className={styles['articleList-container']}>
                            {draftList.length <= 0 && <Empty/>}
                            {draftList.map((draft) => {
                                const items: MenuProps['items'] = [
                                    {
                                        key: 'edit',
                                        label: (
                                            <span onClick={() => {
                                                window.open('/editor/draft/' + draft.id);
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
                                                    delDraft(draft.id).then(res => {
                                                        if (res.msg === 'success') {
                                                            messageApi.success('删除成功');
                                                        } else {
                                                            messageApi.error('删除失败');
                                                        }
                                                        getDraftList(userId);
                                                    })
                                                }
                                            }}>
                                            删除
                                        </span>
                                        ),
                                    },
                                ];
                                return <ArticleItem
                                    key={draft.id}
                                    title={draft.title}
                                    articleId={draft.id}
                                    operateMenuItems={items}
                                    cover={draft.cover}
                                    tags={draft.tags}
                                    summary={draft.summary}
                                    updateTime={draft.update_time}
                                    itemOnClick={() => window.open('/editor/draft/' + draft.id)}
                                />
                            })}
                        </div>
                    }
                />

            </CreatorSideBarLayout>
        </NavLayout>
    </>
}


export default DraftPage;

