import {useCallback, useEffect, useState} from "react";
import {diagramType, setDiagram} from "@/store/features/diagramSlice";
import {useDispatch} from "react-redux";
import {UserInfoType} from "@/store/features/userSlice";
import {apiClient} from "@/clientApi";
import {useAppSelector} from "@/store";
import useStore from "@/components/Diagram/store";
import type {DiagramCoverDto, DiagramDto, UpdateDiagramRequest} from "@/shared/api/diagrams";
import type {ApiResponse} from "@/shared/api/response";


export const useUpdateDiagram = () => {
    const dispatch = useDispatch();
    return useCallback(async (diagram: diagramType, userInfo: UserInfoType) => {
        const apiData: UpdateDiagramRequest = {
            id: diagram.id,
            intro: diagram.intro,
            tags: diagram.tags,
            title: diagram.title,
            data: diagram.data,
            author_id: userInfo.id,
            cover: diagram.cover,
            type: diagram.type,
        }
        const endpoint = diagram.id === 'new' ? 'diagrams' : `diagrams/${diagram.id}`;
        const res = await apiClient(endpoint,  {
            method: diagram.id === 'new' ? 'POST' : 'PATCH',
            body: JSON.stringify(apiData),
        }) as ApiResponse<{ insertId?: number }>;
        if(res.ok) {
            if(res.data.insertId){
                // 新建的会带insertId,更新操作的insertId是0
                dispatch(setDiagram({
                    ...diagram,
                    id: res.data.insertId,
                }))
                return {
                    id: res.data.insertId,
                    msg: "success"
                }
            } else{
                // 更新操作
                return {
                    id: diagram.id,
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

export const useGetDiagram = () => {
    const dispatch = useDispatch();
    const diagram = useAppSelector(state => state.rootReducer.diagramReducer.value);
    const initDiagram = useStore((state) => state.initDiagram);
    return useCallback(async (diagramId: number) => {
        const res = await apiClient(`diagrams/${diagramId}`) as ApiResponse<DiagramDto>;
        if(res.ok) {
            // 更新全局store
            dispatch(setDiagram({
                ...diagram,
                ...res.data,
            }))
            // 更新图表store
            initDiagram(res.data.data);
        }
    }, [diagram, dispatch, initDiagram])
}

export const useGetDiagramsList = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const [diagramsList, setDiagramsList] = useState<DiagramDto[]>([]);
    const getDiagramsList = useCallback(async () => {
        if (!userInfo.id) return;
        const res = await apiClient(`users/${userInfo.id}/diagrams`) as ApiResponse<DiagramDto[]>;
        if(res.ok) {
            setDiagramsList(res.data);
        }
    },[userInfo.id]);
    useEffect(() => {
        getDiagramsList();
    },[getDiagramsList])
    return[ diagramsList, getDiagramsList ] as [ DiagramDto[], () => Promise<void> ];
}

export const useDeleteDiagram = () => {
    return useCallback(async (id: number) => {
        await apiClient(`diagrams/${id}`, { method: 'DELETE' });
    }, []);
}

export const useRenameDiagram = () => {
    return useCallback(async (title: string, id: number) => {
        await apiClient(`diagrams/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ title }),
        })
    }, []);
}

export const useGetDiagramCoverById = () => {
    return useCallback(async (id: number) => {
        const res = await apiClient(`diagrams/${id}?mode=cover`) as ApiResponse<DiagramCoverDto>;
        return res.ok ? res.data : undefined;
    }, []);
}
