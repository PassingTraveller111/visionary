'use client';

import {useEffect, useState} from 'react';
import Link from 'next/link';
import {apiClient} from '@/clientApi';
import type {ArticleColumnDto, ArticleMetaDto} from '@/shared/api/article';
import type {ApiResponse} from '@/shared/api/response';
import styles from './index.module.scss';

type ArticleReaderMetaProps = {
    articleId: number;
    initialLookCount?: number;
    initialColumns?: ArticleColumnDto[];
};

const ArticleReaderMeta = (props: ArticleReaderMetaProps) => {
    const {articleId, initialLookCount = 0, initialColumns = []} = props;
    const [meta, setMeta] = useState<ArticleMetaDto>({
        look_count: initialLookCount,
        columns: initialColumns,
    });

    useEffect(() => {
        let ignore = false;
        setMeta({look_count: initialLookCount, columns: initialColumns});

        const fetchMeta = () => {
            apiClient(`articles/${articleId}/meta`).then((res: ApiResponse<ArticleMetaDto>) => {
                if (ignore || !res.ok) return;
                setMeta({
                    look_count: res.data.look_count ?? 0,
                    columns: res.data.columns ?? [],
                });
            }).catch(console.error);
        };

        const refreshAfterReadingRecord = (event: Event) => {
            const insertedArticleId = (event as CustomEvent<{ articleId?: number }>).detail?.articleId;
            if (insertedArticleId === articleId) fetchMeta();
        };

        fetchMeta();
        window.addEventListener('article-reading-record-inserted', refreshAfterReadingRecord);

        return () => {
            ignore = true;
            window.removeEventListener('article-reading-record-inserted', refreshAfterReadingRecord);
        };
    }, [articleId, initialColumns, initialLookCount]);

    return <>
        <span className={styles.view}>阅读 {meta.look_count ?? 0}</span>
        {meta.columns && meta.columns.length > 0 && (
            <span className={styles.columns}>
                <span>专栏 </span>
                {meta.columns.map((column, index) => (
                    <span key={column.column_id}>
                        {index > 0 && <span className={styles.columnSeparator}>/</span>}
                        <Link className={styles.columnLink} href={`/userCenter/Columns/${column.column_id}`}>{column.column_name}</Link>
                    </span>
                ))}
            </span>
        )}
    </>;
};

export default ArticleReaderMeta;
