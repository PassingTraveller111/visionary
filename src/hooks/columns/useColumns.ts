import {useCallback, useEffect, useState} from "react";
import {useAppSelector} from "@/store";
import {apiClient, apiList} from "@/clientApi";
import {
    getColumnsByUserIdReqType,
    getColumnsByUserIdResType
} from "@/app/api/protected/columns/getColumnsByUserId/route";
import {deleteColumnReqType} from "@/app/api/protected/columns/deleteColumn/route";


export const useGetColumns = () => {
    const [ columns, setColumns ] = useState<getColumnsByUserIdResType['data']>([]);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const getColumns =  useCallback((userId: number) => {
        const apiData: getColumnsByUserIdReqType = {
            userId,
        }
        apiClient(apiList.post.protected.columns.getColumnsByUserId,
            {
                method: "POST",
                body: JSON.stringify(apiData)
            }
        ).then((res: getColumnsByUserIdResType) => {
            if(res.msg === 'success') setColumns(res.data);
            else setColumns([]);
        });
    }, []);
    useEffect(() => {
        if(userInfo.id) getColumns(userInfo.id)
    },[getColumns, userInfo.id]);
    return [ columns, getColumns ] as [ columns: getColumnsByUserIdResType['data'], (userId: number) => void ];
}

export const useDeleteColumn = () => {
    return useCallback(async (column_id: number) => {
        const apiData: deleteColumnReqType = {
            column_id,
        }
        return apiClient(apiList.post.protected.columns.deleteColumn, {
            method: 'POST',
            body: JSON.stringify(apiData),
        })
    }, [])
}