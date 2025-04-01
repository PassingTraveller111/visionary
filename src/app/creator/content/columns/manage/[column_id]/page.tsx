'use client'
import NavLayout from "@/components/NavLayout";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import CreatorList from "@/components/CreatorList";
import {Button, Modal, Spin, Transfer, TransferProps} from "antd";
import {useParams, useRouter} from "next/navigation";
import {
    useGetArticleListByColumnId,
    useGetArticleListToColumn,
    useGetColumn
} from "@/hooks/columns/useColumns";
import {IconFont} from "@/components/IconFont";
import styles from './index.module.scss';
import {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import ArticleItem from "@/components/ArticleItem";
import {apiClient, apiList} from "@/clientApi";
import {
    updateColumnArticleListReqType,
    updateColumnArticleListResType
} from "@/app/api/protected/columns/updateColumnArticleList/route";
import {Key} from "react";
import useMessage from "antd/es/message/useMessage";

const ColumnsPage = () => {
    const column_id = Number(useParams().column_id);
    const [articleList, getArticleList] = useGetArticleListByColumnId();
    const [ column ] = useGetColumn(column_id);
    const router = useRouter();
    const addModalRef = useRef<ManageArticleModalRef>(null);
    const onAddArticle = () => {
        if(addModalRef.current) addModalRef.current.openModal();
    }
    const backToColumns = () => {
        router.push(`/creator/content/columns`);
    }
    const onReload = () => {
        getArticleList(column_id);
    }
    useEffect(() => {
        getArticleList(column_id);
    }, [column_id, getArticleList])
    return <NavLayout>
        <CreatorSideBarLayout
            selectedMenuKey='columns'
        >
            <ManageArticleModal
                ref={addModalRef}
                column_id={column_id}
                onReload={onReload}
            />
            <CreatorList
                NavLeftContent={<>
                    <IconFont
                        className={styles.leftNavBack}
                        type='icon-leftArrow'
                        onClick={backToColumns}
                    />
                    <span>{column.column_name}</span>
                </>}
                NavRightContent={<Button onClick={onAddArticle} type={'primary'}>管理文章</Button>}
                ListContent={<div>
                    {articleList.map(article => {
                        return <ArticleItem
                            key={article.id}
                            title={article.title}
                            articleId={article.id}
                            tags={article.tags}
                            updateTime={article.updated_time}
                            summary={article.summary}
                            cover={article.cover}
                        />
                    })}
                </div>}
            />
        </CreatorSideBarLayout>
    </NavLayout>
}

export default ColumnsPage;

type ManageArticleModalRef = {
    openModal: () => void;
}
type ManageArticleModalProps = {
    column_id: number;
    onReload: () => void;
}
const ManageArticleModal = forwardRef<ManageArticleModalRef, ManageArticleModalProps>(function ManageArticleModal(props: ManageArticleModalProps, ref)  {
    const { column_id, onReload } = props;
    const [open, setOpen] = useState(false);
    const [, getArticleList] = useGetArticleListToColumn();
    const [, getArticleListByColumnId] = useGetArticleListByColumnId();
    const [targetKeys, setTargetKeys] = useState<Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<Key[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dataSource, setDataSource] = useState<{
        key: string,
        title: string,
    }[]>([]);
    const [messageApi, messageContextHandle] = useMessage();
    useImperativeHandle(ref, () => ({
        openModal
    }));
    const openModal = async () => {
        setOpen(true);
        setIsLoading(true);
        const sourceList =  await getArticleList();
        const targetList = await getArticleListByColumnId(column_id)
        const targetKeys = targetList.map(item => {
            return item.id.toString();
        });
        setDataSource([
            ...new Set([
                ...sourceList.map(item => {
                    return {
                        key: item.id.toString(),
                        title: item.title
                    }
                }),
                ...targetList.map(item => {
                    return {
                        key: item.id.toString(),
                        title: item.title
                    }
                })
            ])
        ]);
        setTargetKeys(targetKeys);
        setIsLoading(false);
    }

    const onChange: TransferProps['onChange'] = (nextTargetKeys) => {
        setTargetKeys(nextTargetKeys);
    };

    const onSelectChange: TransferProps['onSelectChange'] = (
        sourceSelectedKeys,
        targetSelectedKeys,
    ) => {
        setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    };

    const onUpdateColumnArticleList = async () => {
        const apiData: updateColumnArticleListReqType = {
            column_id,
            article_ids: targetKeys,
        }
        const res: updateColumnArticleListResType = await apiClient(apiList.post.protected.columns.updateColumnArticleList, {
            method: 'POST',
            body: JSON.stringify(apiData),
        })
        messageApi.success(res.msg === 'success' ? '修改成功' : '修改失败');
        setOpen(false);
        onReload();
    }
    return <>
        {messageContextHandle}
        <Modal
            title={<div className={styles.ManageArticleModalTitle}>
                <span>管理文章</span><span className={styles.help}>｜已同时收录于三专栏的文章将不在可添加文章列表</span>
            </div>}
            width={700}
            open={open}
            onCancel={() => setOpen(false)}
            onOk={onUpdateColumnArticleList}
        >
            <div className={styles.ManageArticleModalList}>
                {isLoading ?
                    <Spin/>
                    :
                    <Transfer
                        dataSource={dataSource}
                        titles={['可添加文章', '已添加文章']}
                        targetKeys={targetKeys}
                        selectedKeys={selectedKeys}
                        onChange={onChange}
                        onSelectChange={onSelectChange}
                        render={(item) => item.title}
                        listStyle={{
                            width: 300,
                            height: 300,
                        }}
                    />
                }
            </div>
        </Modal>
    </>
})