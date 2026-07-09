import {useCallback, useEffect, useState} from "react";
import {useAppSelector} from "@/store";
import {apiClient} from "@/clientApi";
import type {ColumnArticleItemDto, ColumnCandidateArticleDto} from "@/shared/api/article";
import type {ApiResponse} from "@/shared/api/response";
import type {ColumnDto} from "@/shared/api/columns";


export const useGetColumns = (autoLoad = true) => {
    const [ columns, setColumns ] = useState<ColumnDto[]>([]);
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const getColumns =  useCallback((userId: number) => {
        apiClient(`users/${userId}/columns`).then((res: ApiResponse<ColumnDto[]>) => {
            if(res.ok) setColumns(res.data);
            else setColumns([]);
        });
    }, []);
    useEffect(() => {
        if(autoLoad && userInfo.id) getColumns(userInfo.id)
    },[autoLoad, getColumns, userInfo.id]);
    return [ columns, getColumns ] as [ columns: ColumnDto[], (userId: number) => void ];
}

export const useDeleteColumn = () => {
    return useCallback(async (column_id: number) => {
        const res = await apiClient(`columns/${column_id}`, { method: 'DELETE' }) as ApiResponse<unknown>;
        if (res.ok) return { msg: 'success' as const, data: res.data };
        return { msg: 'error' as const };
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
        apiClient(`columns/${column_id}`).then((res: ApiResponse<columnType>) => {
            if(res.ok) setColumn(res.data);
        })
    }, []);

    useEffect(() => {
        getColumn(column_id);
    }, [column_id, getColumn]);

    return [ column ] as [ columnType ]
}

export const useGetArticleListToColumn = () => {
    const [articleList, setArticleList] = useState<ColumnCandidateArticleDto[]>([]);
    const getArticleListToColumn = useCallback(async () => {
        const res = await apiClient('articles/column-candidates') as ApiResponse<ColumnCandidateArticleDto[]>;
        if(res.ok) {
            setArticleList(res.data);
            return res.data;
        }
        return [];
    }, [])

    return [ articleList, getArticleListToColumn ] as [ articleList: ColumnCandidateArticleDto[], () => Promise<ColumnCandidateArticleDto[]> ];
}

export const useGetArticleListByColumnId = () => {
    const [articleList, setArticleList] = useState<ColumnArticleItemDto[]>([]);
    const getArticleListByColumn = useCallback(async (column_id: number) => {
        const res = await apiClient(`columns/${column_id}/articles`) as ApiResponse<ColumnArticleItemDto[]>;
        if(res.ok) {
            setArticleList(res.data);
            return res.data;
        }
        return [];
    }, [])
    return [articleList, getArticleListByColumn] as [ColumnArticleItemDto[], (column_id: number) => Promise<ColumnArticleItemDto[]> ];
}
