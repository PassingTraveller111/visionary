import {useCallback, useEffect, useState} from "react";
import {diagramType, setDiagram} from "@/store/features/diagramSlice";
import {useDispatch} from "react-redux";
import {UserInfoType} from "@/store/features/userSlice";
import {apiClient, apiList} from "@/clientApi";
import {updateDiagramReqType} from "@/app/api/protected/diagrams/updateDiagram/route";
import {getDiagramReqType, getDiagramResType} from "@/app/api/protected/diagrams/getDiagram/route";
import {useAppSelector} from "@/store";
import useStore from "@/components/Diagram/store";
import {getDiagramsListResType} from "@/app/api/protected/diagrams/getDiagramsList/route";
import {delDiagramReqType} from "@/app/api/protected/diagrams/delDiagram/route";


export const useUpdateDiagram = () => {
    const dispatch = useDispatch();
    return useCallback(async (diagram: diagramType, userInfo: UserInfoType) => {
        const apiData: updateDiagramReqType = {
            id: diagram.id,
            intro: diagram.intro,
            tags: diagram.tags,
            title: diagram.title,
            data: diagram.data,
            author_id: userInfo.id,
            cover: diagram.cover,
            type: diagram.type,
        }
        const res = await apiClient(apiList.post.protected.diagrams.updateDiagram,  {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
        if(res.msg === "success") {
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
        const apiData: getDiagramReqType = {
            id: diagramId,
        }
        const res: getDiagramResType = await apiClient(apiList.post.protected.diagrams.getDiagram, {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
        console.log(res);
        if(res.msg === "success") {
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
    const [diagramsList, setDiagramsList] = useState<getDiagramsListResType['data']>([]);
    const getDiagramsList = useCallback(async () => {
        const res: getDiagramsListResType = await apiClient(apiList.get.protected.diagrams.getDiagramsList);
        if(res.msg === "success") {
            setDiagramsList(res.data);
        }
    },[]);
    useEffect(() => {
        getDiagramsList();
    },[getDiagramsList])
    return[ diagramsList, getDiagramsList ] as [ getDiagramsListResType['data'], () => Promise<void> ];
}

export const useDeleteDiagram = () => {
    return useCallback(async (id: number) => {
        const apiData: delDiagramReqType = {
            id,
        }
        const res = await apiClient(apiList.post.protected.diagrams.delDiagram, {
            method: 'POST',
            body: JSON.stringify(apiData),
        });
        console.log(res);
    }, []);
}