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

const DraftPage = () => {
    const { draftId } =  useParams();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const [messageApi, contextHandle] = useMessage();
    const router = useRouter();
    const updateDraft = useUpdateDraft();
    const getDraft = useGetDraft();
    const publishDraft = usePublishDraft();
    const draft = useAppSelector(state => state.rootReducer.draftReducer.value);
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
    const initDraft = useCallback(async () => {
        const id = draftId === 'new' ? draftId : Number(draftId);
        dispatch(setDraft({
            ...draft,
            id,
        }));
        if (typeof id === 'number') {
            getDraft(id);
        }
    }, [draftId]);
    useEffect(() => {
        initDraft();
    }, [initDraft]);
    const onSaveDraft = async () => {
        const res = await updateDraft();
        if(res.msg === "success") {
            messageApi.success('更新成功');
        }else {
            messageApi.error('更新失败');
        }
    }
    const onPublicArticle = () => {
        updateDraft().then(res => {
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

