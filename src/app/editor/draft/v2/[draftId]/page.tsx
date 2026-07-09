'use client'

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import {Spin} from 'antd';
import useMessage from 'antd/es/message/useMessage';
import MdEditorV2 from '@/components/MdEditorV2';
import EditorHeader from '@/components/EditorHeader';
import {AppDispatch, useAppSelector} from '@/store';
import {useDispatch} from 'react-redux';
import {draftType, setDraft} from '@/store/features/draftSlice';
import {UserInfoType} from '@/store/features/userSlice';
import {useGetDraft, usePublishDraft, useUpdateDraft} from '@/hooks/drafts/useDrafts';
import styles from './index.module.scss';

const createDebouncedSave = <T extends (...args: Parameters<T>) => void>(callback: T, delay: number) => {
    let timer: number | undefined;

    return (...args: Parameters<T>) => {
        if (timer) window.clearTimeout(timer);
        timer = window.setTimeout(() => callback(...args), delay);
    };
}

const DraftV2Page = () => {
    const params = useParams();
    const draftId = Array.isArray(params.draftId) ? params.draftId[0] : params.draftId;
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const draft = useAppSelector(state => state.rootReducer.draftReducer.value);
    const [messageApi, contextHandle] = useMessage();
    const router = useRouter();
    const updateDraft = useUpdateDraft();
    const getDraft = useGetDraft();
    const publishDraft = usePublishDraft();
    const dispatch = useDispatch<AppDispatch>();
    const [isEditorReady, setIsEditorReady] = useState(draftId === 'new');
    const [DraftSaveStatus, setDraftSaveStatus] = useState<'success' | 'error' | 'loading'>('success');
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const debounceSaveRef = useRef<((currentDraft: draftType, currentUser: UserInfoType, version: number) => void) | null>(null);
    const saveVersionRef = useRef(0);

    const saveDraftNow = useCallback(async (currentDraft: draftType, currentUser: UserInfoType, version: number) => {
        if (currentDraft.id === undefined) return;
        try {
            setDraftSaveStatus('loading');
            const res = await updateDraft(currentDraft, currentUser);
            setDraftSaveStatus(res.msg === 'success' ? 'success' : 'error');
            if (res.msg === 'success') {
                setLastSavedAt(new Date());
                if (version === saveVersionRef.current) setHasUnsavedChanges(false);
            }
        } catch (error) {
            console.error('保存失败:', error);
            setDraftSaveStatus('error');
        }
    }, [updateDraft]);

    useEffect(() => {
        debounceSaveRef.current = createDebouncedSave((currentDraft: draftType, currentUser: UserInfoType, version: number) => {
            void saveDraftNow(currentDraft, currentUser, version);
        }, 2000);
    }, [saveDraftNow]);

    const scheduleSaveDraft = useCallback((nextDraft: draftType) => {
        if (debounceSaveRef.current && nextDraft.id !== undefined) {
            const version = saveVersionRef.current + 1;
            saveVersionRef.current = version;
            setHasUnsavedChanges(true);
            debounceSaveRef.current(nextDraft, userInfo, version);
        }
    }, [userInfo]);

    useEffect(() => {
        const shouldBlockUnload = hasUnsavedChanges || DraftSaveStatus === 'loading' || DraftSaveStatus === 'error';
        if (!shouldBlockUnload) return;

        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [DraftSaveStatus, hasUnsavedChanges]);

    const onEditorHeaderChange = useCallback((title: string) => {
        const nextDraft = {
            ...draft,
            title,
        };
        dispatch(setDraft(nextDraft));
        scheduleSaveDraft(nextDraft);
    }, [dispatch, draft, scheduleSaveDraft]);

    const onEditorChange = useCallback((content: string) => {
        dispatch(setDraft({
            ...draft,
            content,
        }));
    }, [dispatch, draft]);

    const onEditorAutoSave = useCallback((content?: string) => {
        const nextDraft = {
            ...draft,
            content: content ?? draft.content,
        };
        scheduleSaveDraft(nextDraft);
    }, [draft, scheduleSaveDraft]);

    useEffect(() => {
        if(userInfo.id === 0 || !draftId) return;
        let isActive = true;

        const initDraft = async () => {
            const id = draftId === 'new' ? draftId : Number(draftId);
            setIsEditorReady(false);

            if (typeof id === 'number' && !Number.isNaN(id)) {
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
                .then(res => ({ draftId: res.id }))
                .then(res => {
                    if (!isActive || !res.draftId) return;
                    router.push('/editor/draft/v2/' + res.draftId);
                });
        }

        void initDraft();
        return () => {
            isActive = false;
        }
    }, [dispatch, draftId, getDraft, router, updateDraft, userInfo]);

    const onManualSaveDraft = useCallback(() => {
        const version = saveVersionRef.current + 1;
        saveVersionRef.current = version;
        setHasUnsavedChanges(true);
        void saveDraftNow(draft, userInfo, version);
    }, [draft, saveDraftNow, userInfo]);

    const onPublicArticle = () => {
        updateDraft(draft, userInfo).then(res => {
            if(res.msg === 'success') {
                publishDraft().then(res => {
                    if(res.msg === 'success') {
                        messageApi.success('发布成功').then(() => {
                            router.push('/userCenter/' + userInfo.id + '/article');
                        });
                    } else {
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
            onSaveDraft={onManualSaveDraft}
            onPublicArticle={onPublicArticle}
            DraftSaveStatus={DraftSaveStatus}
        />
        <div className={styles.content}>
            <div className={styles.leftContent}>
                {draft.isLoading && <div className={styles.loading}>
                    <Spin size="large" />
                </div>}
                {isEditorReady && <MdEditorV2
                    key={draft.id}
                    value={draft.content}
                    onChange={onEditorChange}
                    onSaveDraft={onEditorAutoSave}
                    saveStatus={DraftSaveStatus}
                    lastSavedAt={lastSavedAt}
                    hasUnsavedChanges={hasUnsavedChanges}
                    onRetrySave={onManualSaveDraft}
                />}
            </div>
        </div>
    </>
}

export default DraftV2Page;
