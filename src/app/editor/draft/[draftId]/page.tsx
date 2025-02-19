"use client"
import MdEditor from "@/components/MdEditor";
import {useParams} from "next/navigation";
import React, {useCallback, useEffect} from "react";
import EditorHeader from "@/components/EditorHeader";
import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {setDraft} from "@/store/features/draftSlice";
import {useGetDraft, usePublishDraft, useUpdateDraft} from "@/hooks/drafts/useDrafts";

const DraftPage = () => {
    const { draftId } =  useParams();
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
            console.log('更新成功');
        }else {
            console.log('更新失败');
        }
    }
    const onPublicArticle = () => {
        publishDraft();
    }
    return <>
        <EditorHeader
            draft={draft}
            onTitleChange={onEditorHeaderChange}
            onSaveDraft={onSaveDraft}
            onPublicArticle={onPublicArticle}
        />
        <MdEditor value={draft.content} onChange={onEditorChange} />
    </>
}
export default DraftPage;

