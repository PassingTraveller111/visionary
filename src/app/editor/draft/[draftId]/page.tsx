"use client"
import MdEditor from "@/components/MdEditor";
import {useParams, useRouter} from "next/navigation";
import React, {useCallback, useEffect} from "react";
import EditorHeader from "@/components/EditorHeader";
import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {setDraft} from "@/store/features/draftSlice";
import {useGetDraft, usePublishDraft, useUpdateDraft} from "@/hooks/drafts/useDrafts";
import useMessage from "antd/es/message/useMessage";
import Assistant from "@/components/Assistant";
import styles from './index.module.scss';
import {useInitAssistantChat} from "@/hooks/assistant_chat/useAssistantChant";

const DraftPage = () => {
    const { draftId } =  useParams();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const draft = useAppSelector(state => state.rootReducer.draftReducer.value);
    const [messageApi, contextHandle] = useMessage();
    const router = useRouter();
    const updateDraft = useUpdateDraft();
    const initAssistant = useInitAssistantChat();
    const getDraft = useGetDraft();
    const publishDraft = usePublishDraft();
    const dispatch = useDispatch<AppDispatch>();
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
    const initDraft = useCallback(() => {
        const id = draftId === 'new' ? draftId : Number(draftId);
        dispatch(setDraft({
            ...draft,
            id,
        }));
        if (typeof id === 'number') {
            getDraft(id).then(async () => {
                // 获取聊天记录
                await initAssistant(id, false);
            })
        } else {
            // 新建草稿记录
            updateDraft(draft, userInfo)
            .then(async (res) => {
                // 新建聊天记录
                await initAssistant(res.id);
                return {
                    draftId: res.id
                }
            }).then(res => {
                console.log(res);
                // 跳转到新页面
                router.push('/editor/draft/' + res.draftId);
            })
        }
    }, [dispatch, draft, draftId, getDraft, router, updateDraft, userInfo]);
    useEffect(() => {
        if(userInfo.id === 0) return;
        initDraft();
    }, [userInfo.id]);
    const onSaveDraft = async () => {
        const res = await updateDraft(draft, userInfo);
        if(res.msg === "success") {
            messageApi.success('更新成功');
        }else {
            messageApi.error('更新失败');
        }
    }
    const onPublicArticle = () => {
        updateDraft(draft, userInfo).then(res => {
            if(res.msg === "success") {
                publishDraft().then(res => {
                    if(res.msg === "success") {
                        messageApi.success('发布成功').then(() => {
                            router.push('/profile/' + userInfo.id);
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
        />
        <div className={styles.content}>
            <MdEditor
                className={styles.editor}
                value={draft.content}
                onChange={onEditorChange}
            />
            <Assistant />
        </div>
    </>
}
export default DraftPage;

