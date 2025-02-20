import {useAppSelector} from "@/store";
import {apiClient, apiList} from "@/clientApi";
import {updateDraftDataType} from "@/app/api/protected/draft/updateDraft/route";
import {setDraft} from "@/store/features/draftSlice";
import {useDispatch} from "react-redux";
import {getDraftDataType, getDraftResponseType} from "@/app/api/protected/draft/getDraft/route";
import {publishDraftDataType, publishDraftResponseType} from "@/app/api/protected/draft/publishDraft/route";
import {useState} from "react";
import {getDraftListResponseType, itemType} from "@/app/api/protected/draft/getDraftList/route";
import {delDraftRequestType} from "@/app/api/protected/draft/delDraft/route";

export const useUpdateDraft = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value)
    const draft = useAppSelector(state => state.rootReducer.draftReducer.value);
    const dispatch = useDispatch();
    return async () => {
        const apiData: updateDraftDataType = {
            draftId: draft.id,
            summary: draft.summary,
            tags: draft.tags,
            title: draft.title,
            content: draft.content,
            author_id: userInfo.id,
            author_nickname: userInfo.nick_name,
        }
        const res = await apiClient(apiList.post.protected.draft.updateDraft,  {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
        if(res.msg === "success") {
            const newId = res.data.insertId;
            dispatch(setDraft({
                ...draft,
                id: newId,
            }))
            return {
                id: newId,
                msg: "success"
            }
        } else {
            return {
                msg: "error",
            }
        }
    }
}

export const useGetDraft = () => {
    const draft = useAppSelector(state => state.rootReducer.draftReducer.value);
    const dispatch = useDispatch();
    return async (id: number) => {
        const apiData: getDraftDataType = {
            draftId: id,
        };
        const res: getDraftResponseType = await apiClient(apiList.post.protected.draft.getDraft, {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
        if (res.msg === "success") {
            dispatch(setDraft({
                ...draft,
                ...res.data,
            }))
            return {
                msg: "success"
            }
        }
        return {
            msg: 'error',
        }
    }
};

export const usePublishDraft = () => {
    const draft = useAppSelector(state => state.rootReducer.draftReducer.value);
    return async () => {
        const apiData: publishDraftDataType = {
            draftId: draft.id as number,
        };
        const res: publishDraftResponseType = await apiClient(apiList.post.protected.draft.publishDraft, {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
        return res;
    }
}

type draftListType = itemType[];

export const useGetDraftList = () => {
    // 草稿列表数据
    const [draftList, setDraftList] = useState<draftListType>([]);
    // 获取文章列表
    const getDraftList =  (userId: number) => {
        if(!userId) return [];
        apiClient(apiList.post.protected.draft.getDraftList, {
            method: "POST",
            body: JSON.stringify({
                authorId: userId,
            })
        }).then((res: getDraftListResponseType) => {
            return setDraftList(res.data);
        })
    };
    return { draftList, getDraftList };
}

export const useDeleteDraft = () => {
    return async (id?: number) => {
        if(!id) return;
        const apiData: delDraftRequestType = {
            id,
        }
        return apiClient(apiList.post.protected.draft.delDraft, {
            method: 'POST',
            body: JSON.stringify(apiData),
        })
    }
}