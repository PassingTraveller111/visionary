'use client'
import NavLayout from "@/components/NavLayout";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import CreatorList from "@/components/CreatorList";
import {Button, Dropdown, Form, Input, Modal} from "antd";
import UploadCover from "@/components/UploadCover";
import {forwardRef, useImperativeHandle, useRef, useState} from "react";
import {apiClient, apiList} from "@/clientApi";
import {useDeleteColumn, useGetColumns} from "@/hooks/columns/useColumns";
import {columnsTableType} from "@/app/api/sql/type";
import styles from "./index.module.scss";
import Image from "next/image";
import {IconFont} from "@/components/IconFont";
import dayjs from "dayjs";
import {useAppSelector} from "@/store";
import useMessage from "antd/es/message/useMessage";


const ColumnsPage = () => {
    const [ columns, getColumnsByUserId ] = useGetColumns();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const modalRef = useRef<ColumnModalMethods>(null);
    const onCreateColumns = () => {
        if(modalRef.current) modalRef.current.onCreateColumn();
    }
    const onUpdateColumns = (column_id: number, column_name: string, description: string, cover_image: string) => {
        if(modalRef.current) modalRef.current.onUpdateColumn(column_id, column_name, description, cover_image);
    }
    const onGetColumns = () => {
        getColumnsByUserId(userInfo.id);
    }
    return <NavLayout>
        <CreatorSideBarLayout
            selectedMenuKey='columns'
        >
            <ColumnModal
                ref={modalRef}
                getColumns={onGetColumns}
            />
            <CreatorList
                NavLeftContent={'专栏管理'}
                NavRightContent={<Button onClick={onCreateColumns} type={'primary'}>新建专栏</Button>}
                ListContent={<ColumnList columns={columns} onUpdateColumns={onUpdateColumns} getColumns={onGetColumns}/>}
            />
        </CreatorSideBarLayout>
    </NavLayout>
}

export default ColumnsPage;

interface ColumnModalMethods {
    onCreateColumn: () => void;
    onUpdateColumn: (column_id: number, column_name: string, description: string, cover_image: string) => void;
}

const initFormValue = {
    column_id: 0,
    column_name: '',
    description: '',
    cover_image: '',
}
const ColumnModal = forwardRef<ColumnModalMethods, { getColumns: () => void }>(function ColumnModal(props, ref) {
    const { getColumns } = props;
    const [ modalIsOpen, setModalIsOpen ] = useState(false);
    const [ formValue, setFormValue ] = useState(initFormValue);
    const [ modalTitle, setModalTitle ] = useState('');
    const [messageApi, contextHandle] = useMessage();
    const onCreateColumn = () => {
        setModalTitle('新建专栏');
        setFormValue(initFormValue);
        setModalIsOpen(true);
    }
    const onUpdateColumn = (column_id: number, column_name: string, description: string, cover_image: string) => {
        setModalTitle('修改专栏');
        setFormValue({
            column_id,
            cover_image,
            description,
            column_name,
        });
        setModalIsOpen(true);
    }
    // 将方法暴露给父组件
    useImperativeHandle(ref, () => ({
        onCreateColumn,
        onUpdateColumn
    }));
    const onFinish = () => {
        const apiData = {
            column_id: formValue.column_id,
            column_name: formValue.column_name,
            description: formValue.description,
            cover_image: formValue.cover_image,
        }
        apiClient(apiList.post.protected.columns.updateColumn, {
            method: 'POST',
            body: JSON.stringify(apiData),
        }).then(res => {
            setModalIsOpen(false);
            if (res.msg === 'success') {
                messageApi.success(formValue.column_id === 0 ? '创建成功' : '修改成功');
            } else {
                messageApi.success(formValue.column_id === 0 ? '创建失败' : '修改失败');
            }
            getColumns();
        })
    }
    return <>
        {contextHandle}
        <Modal
            open={modalIsOpen}
            title={modalTitle}
            onOk={() => {
                onFinish();
            }}
            destroyOnClose={true}
            onCancel={() => { setModalIsOpen(false) }}
        >
            <Form
                labelCol={{span: 4}}
                wrapperCol={{span: 16}}
            >
                <Form.Item
                    label='专栏名称'
                >
                    <Input
                        maxLength={50}
                        value={formValue.column_name}
                        onChange={(e) => setFormValue((pre) => {
                            return {
                                ...pre,
                                column_name: e.target.value,
                            }
                        })}
                    />
                </Form.Item>
                <Form.Item
                    label='专栏简介'
                >
                    <Input.TextArea
                        maxLength={200}
                        rows={4}
                        value={formValue.description}
                        onChange={(e) => setFormValue((pre) => {
                            return {
                                ...pre,
                                description: e.target.value,
                            }
                        })}
                    />
                </Form.Item>
                <Form.Item
                    label="专栏封面"
                >
                    <UploadCover
                        uploadToDir={'columns'}
                        initValue={formValue.cover_image}
                        onChange={(coverList) => {
                            const cover = (coverList.length > 0 && coverList[0].response) ? ('https://' + coverList[0].response.data.Location) : undefined;
                            setFormValue(pre => {
                                return {
                                    ...pre,
                                    cover_image: cover ?? '',
                                }
                            });
                        }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    </>


})

const ColumnList = (props: { columns: columnsTableType[], onUpdateColumns: (column_id: number, column_name: string, description: string, cover_image: string) => void, getColumns: () => void }) => {
    const { columns, getColumns } = props;
    const deleteColumn = useDeleteColumn();
    const [ messageApi, messageContext ] = useMessage();
    return <div>
        {messageContext}
        {columns.map(column => {
            return <div
                key={column.column_id}
                className={styles.columnsItem}
            >
                <div className={styles.columnsItemLeft} >
                    <div className={styles.cover}>
                        {column.cover_image && <Image src={column.cover_image} alt={''} width={150} height={116} />}
                    </div>
                    <div className={styles.text}>
                        <div className={styles.name}>{column.column_name}</div>
                        <div className={styles.description}>{column.description}</div>
                        <div className={styles.time}>{dayjs(column.created_at).format('YYYY-MM-DD')}</div>
                    </div>
                </div>
                <div className={styles.columnsItemRight}>
                    <div className={styles.editMenu}>
                        <Dropdown
                            menu={{
                                items: [
                                    {
                                        key: 'edit',
                                        label: '修改',
                                        onClick: () => {
                                            props.onUpdateColumns(column.column_id, column.column_name, column.description, column.cover_image ?? '');
                                        }
                                    },
                                    {
                                        key: 'delete',
                                        label: '删除',
                                        onClick: () => {
                                            deleteColumn(column.column_id).then((res) => {
                                                messageApi.success(res.msg === 'success' ? '删除成功' : '删除失败');
                                                getColumns();
                                            });
                                        },
                                    },
                                ]
                            }}
                        >
                            <IconFont type='icon-more'  />
                        </Dropdown>
                    </div>
                </div>
            </div>
        })}
    </div>
}