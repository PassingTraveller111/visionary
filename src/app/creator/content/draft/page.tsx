"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import { useEffect } from "react";
import Image from "next/image";
import {Dropdown, MenuProps, Modal, message, Empty} from "antd";
import moreIcon from '../../../../../public/icon/more.svg';
import {HookAPI} from "antd/es/modal/useModal";
import {MessageInstance} from "antd/es/message/interface";
import {useAppSelector} from "@/store";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import {useDeleteDraft, useGetDraftList} from "@/hooks/drafts/useDrafts";



const DraftPage = () => {
    const { id: userId } = useAppSelector(state => state.rootReducer.userReducer.value);
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();
    const { draftList, getDraftList } = useGetDraftList();
    useEffect(() => {
        getDraftList(userId);
    }, [userId]);
    return <>
        {modalContextHolder}
        {messageContextHolder}
        <NavLayout>
            <CreatorSideBarLayout
                selectedMenuKey='draft'
            >
                <div className={styles['container']}>
                    <div className={styles['articleList-container']}>
                        {draftList.length <= 0 && <Empty/>}
                        {draftList.map((draft) => {
                            return <div key={draft.id} className={styles['articleList-item']}
                                        onClick={() => {
                                            window.open('/editor/draft/' + draft.id);
                                        }}
                            >
                                <div>
                                    <div className={styles['article-title']}>
                                        {draft.title}
                                    </div>
                                </div>
                                <div className={styles['article-menu']} onClick={(e) => {
                                    e.stopPropagation()
                                }}>
                                    <ArticleItemMenu
                                        messageApi={messageApi}
                                        modalApi={modalApi}
                                        draft_id={draft.id}
                                        getDraftList={getDraftList}
                                        userId={Number(userId)}
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
    draft_id?: number,
    modalApi: HookAPI,
    messageApi: MessageInstance,
    getDraftList: (userId: number) => void,
    userId: number;
}) => {
    const { modalApi, messageApi, getDraftList, userId, draft_id } = props;
    const delDraft = useDeleteDraft();
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
                        delDraft(draft_id).then(res => {
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
    return <>
        <Dropdown menu={{items}}>
            <Image src={moreIcon} alt='更多' width={30} height={30} />
        </Dropdown>
    </>
}

export default DraftPage;

