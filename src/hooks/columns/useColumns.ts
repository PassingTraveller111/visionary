import {useCallback, useEffect, useState} from "react";
import {useAppSelector} from "@/store";
import {apiClient, apiList} from "@/clientApi";
import {
    getColumnsByUserIdReqType,
    getColumnsByUserIdResType
} from "@/app/api/protected/columns/getColumnsByUserId/route";
import {deleteColumnReqType} from "@/app/api/protected/columns/deleteColumn/route";
import {getArticleListToAddColumnResType} from "@/app/api/protected/article/getArticleListToAddColumn/route";
import {getArticleListByColumnIdResType} from "@/app/api/protected/article/getArticleListByColumnId/route";


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

type columnType = {
    column_id: number,
    column_name: string,
    cover_image: string,
    description: string,
    created_at: string,
    articleList: {
        id: number,
        title: string,
        updateTime: string,
    }[],
}

export const useGetColumn = (column_id: number) => {
    const [column, setColumn] = useState<columnType>({
        column_id: 0,
        column_name: '',
        cover_image: '',
        description: '',
        created_at: '',
        articleList: [],
    });

    const getColumn = useCallback((column_id: number) => {
        apiClient(apiList.post.protected.columns.getColumn, {
            method: 'POST',
            body: JSON.stringify({
                column_id,
            }),
        }).then(res => {
            if(res.msg === 'success') setColumn(res.data);
        })
    }, []);

    useEffect(() => {
        getColumn(column_id);
    }, [column_id, getColumn]);

    return [ column ] as [ columnType ]
}

export const useGetArticleListToColumn = () => {
    const [articleList, setArticleList] = useState<getArticleListToAddColumnResType['data']>([]);
    const getArticleListToColumn = useCallback(async () => {
        const res: getArticleListToAddColumnResType = await apiClient(apiList.post.protected.article.getArticleListToAddColumn, {
            method: 'POST',
        })
        if(res.msg === 'success') setArticleList(res.data);
        return res.data;
    }, [])

    return [ articleList, getArticleListToColumn ] as [ articleList: getArticleListToAddColumnResType['data'], () => Promise<getArticleListToAddColumnResType['data']> ];
}

export const useGetArticleListByColumnId = () => {
    const [articleList, setArticleList] = useState<getArticleListByColumnIdResType['data']>([]);
    const getArticleListByColumn = useCallback(async (column_id: number) => {
        const res: getArticleListByColumnIdResType = await apiClient(apiList.post.protected.article.getArticleListByColumnId, {
            method: 'POST',
            body: JSON.stringify({
                column_id,
            }),
        })
        if(res.msg === 'success') setArticleList(res.data);
        return res.data;
    }, [])
    return [articleList, getArticleListByColumn] as [getArticleListByColumnIdResType['data'], (column_id: number) => Promise<getArticleListByColumnIdResType['data']> ];
}