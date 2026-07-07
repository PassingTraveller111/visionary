"use client"
import MdEditor from "@/components/MdEditor";
import {useParams, useRouter} from "next/navigation";
import React, {useCallback, useEffect, useRef, useState} from "react";
import EditorHeader from "@/components/EditorHeader";
import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {draftType, setDraft} from "@/store/features/draftSlice";
import {useGetDraft, usePublishDraft, useUpdateDraft} from "@/hooks/drafts/useDrafts";
import useMessage from "antd/es/message/useMessage";
import styles from './index.module.scss';
import {debounce} from "next/dist/server/utils";
import {UserInfoType} from "@/store/features/userSlice";
import {Spin} from "antd";

const DraftPage = () => {
    const { draftId } =  useParams();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const draft = useAppSelector(state => state.rootReducer.draftReducer.value);
    const [messageApi, contextHandle] = useMessage();
    const router = useRouter();
    const updateDraft = useUpdateDraft();
    const getDraft = useGetDraft();
    const publishDraft = usePublishDraft();
    const dispatch = useDispatch<AppDispatch>();
    const [isEditorReady, setIsEditorReady] = useState(draftId === 'new');
    const onEditorHeaderChange = (title: string) => {
        dispatch(setDraft(
            {
                ...draft,
                title,
            }
        ))
    }
    const onEditorChange = (content: string) => {
        dispatch(setDraft(
            {
                ...draft,
                content: content,
            }
        ))
    }
    const [DraftSaveStatus, setDraftSaveStatus] = useState<'success' | 'error' | 'loading'>('success');
    useEffect(() => {
        if(userInfo.id === 0) return;
        let isActive = true;
        const initDraft = async () => {
            const id = draftId === 'new' ? draftId : Number(draftId);
            setIsEditorReady(false);

            if (typeof id === 'number') {
                dispatch(setDraft({
                    id,
                    title: '',
                    content: '',
                    isLoading: true,
                }));
                await getDraft(id);
                if (!isActive) return;
                dispatch(setDraft({
                    isLoading: false,
                }));
                setIsEditorReady(true);
                return;
            }

            const newDraft: draftType = {
                id: 'new',
                title: '',
                content: '',
                summary: '',
                tags: [],
                status: 'onlyDraft',
                article_id: 0,
                review_id: 0,
                author_id: userInfo.id,
                cover: '',
                isLoading: false,
            };
            dispatch(setDraft(newDraft));
            setIsEditorReady(true);
            updateDraft(newDraft, userInfo)
            .then((res) => {
                return {
                    draftId: res.id
                }
            }).then(res => {
                if (!isActive) return;
                // 跳转到新页面
                router.push('/editor/draft/' + res.draftId);
            })
        }
        initDraft();
        return () => {
            isActive = false;
        }
    }, [dispatch, draftId, getDraft, router, updateDraft, userInfo]);
    // 使用useRef存储防抖函数，确保实例唯一
    const debounceSaveRef = useRef(null);

    // 初始化防抖函数
    useEffect(() => {
        // 创建防抖函数，接收最新的draft和userInfo作为参数
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        debounceSaveRef.current = debounce(async (currentDraft: draftType, currentUser: UserInfoType) => {
            console.log("实际执行保存:", currentDraft.id);
            try {
                setDraftSaveStatus('loading');
                const res = await updateDraft(currentDraft, currentUser);
                setDraftSaveStatus(res.msg === "success" ? 'success' : 'error');
            } catch (error) {
                console.error('保存失败:', error);
                setDraftSaveStatus('error');
            }
        }, 2000);
    }, [updateDraft]);

    // 使用useCallback确保引用稳定，依赖项包含draft和userInfo
    const onSaveDraft = useCallback(() => {
        if (debounceSaveRef.current && draft.id !== undefined) {
            // 传递最新的draft和userInfo
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            debounceSaveRef.current(draft, userInfo);
        }
    }, [draft, userInfo]);
    const onPublicArticle = () => {
        updateDraft(draft, userInfo).then(res => {
            if(res.msg === "success") {
                publishDraft().then(res => {
                    if(res.msg === "success") {
                        messageApi.success('发布成功').then(() => {
                            router.push('/userCenter/' + userInfo.id + '/article');
                        });
                    }else {
                        messageApi.error('发布失败');
                    }
                })
            }
        })
    }
    return <>
        {contextHandle}
        <EditorHeader
            draft={draft}
            onTitleChange={onEditorHeaderChange}
            onSaveDraft={onSaveDraft}
            onPublicArticle={onPublicArticle}
            DraftSaveStatus={DraftSaveStatus}
        />
        <div className={styles.content}>
            <div className={styles.leftContent}>
                {draft.isLoading && <div className={styles.loading}>
                    <Spin size={'large'} />
                </div>}
                {isEditorReady && <MdEditor
                    key={draft.id}
                    className={styles.editor}
                    value={draft.content}
                    onChange={onEditorChange}
                    onSaveDraft={onSaveDraft}
                />}
            </div>
        </div>
    </>
}
export default DraftPage;
