import {useAppSelector} from "@/store";
import {apiClient} from "@/clientApi";
import {draftType, setDraft} from "@/store/features/draftSlice";
import {useDispatch} from "react-redux";
import {useCallback, useState} from "react";
import {UserInfoType} from "@/store/features/userSlice";
import type {DraftDto, DraftListItemDto, PublishDraftResult, UpdateDraftData} from "@/shared/api/draft";
import type {ApiResponse} from "@/shared/api/response";

export const useUpdateDraft = () => {
    const dispatch = useDispatch();
    return useCallback(async (draft: draftType, userInfo: UserInfoType) => {
        const apiData: UpdateDraftData = {
            draftId: draft.id,
            summary: draft.summary,
            tags: draft.tags,
            title: draft.title,
            content: draft.content,
            author_id: userInfo.id,
            author_nickname: userInfo.nick_name,
            cover: draft.cover,
        }
        const endpoint = draft.id === 'new' ? 'drafts' : `drafts/${draft.id}`;
        const res = await apiClient(endpoint,  {
            method: draft.id === 'new' ? 'POST' : 'PATCH',
            body: JSON.stringify(apiData),
        }) as ApiResponse<{ insertId?: number }>;
        if(res.ok) {
            if(res.data.insertId){
                // 新建的会带insertId,更新操作的insertId是0
                dispatch(setDraft({
                    ...draft,
                    id: res.data.insertId,
                }))
                return {
                    id: res.data.insertId,
                    msg: "success"
                }
            } else{
                return {
                    id: draft.id,
                    msg: "success"
                }
            }
        } else {
            return {
                msg: "error",
            }
        }
    }, [dispatch])
}

export const useGetDraft = () => {
    const dispatch = useDispatch();
    return useCallback(async (id: number) => {
        const res = await apiClient(`drafts/${id}`) as ApiResponse<DraftDto>;
        if (res.ok) {
            dispatch(setDraft({
                ...res.data,
            }))
            return {
                msg: "success",
                data: res.data,
            }
        }
        return {
            msg: 'error',
        }
    }, [dispatch])
};

export const usePublishDraft = () => {
    const draft = useAppSelector(state => state.rootReducer.draftReducer.value);
    return async () => {
        const res = await apiClient(`drafts/${draft.id}/publish`, {
            method: 'POST',
        }) as ApiResponse<PublishDraftResult>;
        if (res.ok) return { msg: 'success' as const, data: res.data };
        return { msg: 'error' as const };
    }
}

type draftListType = DraftListItemDto[];

export const useGetDraftList = () => {
    // 草稿列表数据
    const [draftList, setDraftList] = useState<draftListType>([]);
    // 获取文章列表
    const getDraftList =  useCallback((userId: number) => {
        if(!userId) return [];
        apiClient(`users/${userId}/drafts`).then((res: ApiResponse<DraftListItemDto[]>) => {
            if (res.ok) return setDraftList(res.data);
        })
    }, []);
    return { draftList, getDraftList };
}

export const useDeleteDraft = () => {
    return async (id?: number) => {
        if(!id) return { msg: 'error' as const, data: '' };
        const res = await apiClient(`drafts/${id}`, { method: 'DELETE' }) as ApiResponse<string>;
        if (res.ok) return { msg: 'success' as const, data: res.data };
        return { msg: 'error' as const, data: '' };
    }
}
