'use client'
import NavLayout from "@/components/NavLayout";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import CreatorList from "@/components/CreatorList";
import {Button, Dropdown, Form, FormProps, Input, Modal} from "antd";
import UploadCover from "@/components/UploadCover";
import {useState} from "react";
import {apiClient, apiList} from "@/clientApi";
import {useGetColumns} from "@/hooks/columns/useColumns";
import {columnsTableType} from "@/app/api/sql/type";
import styles from "./index.module.scss";
import Image from "next/image";
import {IconFont} from "@/components/IconFont";
import dayjs from "dayjs";


const ColumnsPage = () => {
    const [ modalIsOpen, setModalIsOpen ] = useState(false);
    const [ columns ] = useGetColumns();
    const onCreateColumns = () => {
        setModalIsOpen(true);
    }
    return <NavLayout>
        <CreatorSideBarLayout
            selectedMenuKey='columns'
        >
            <ColumnModal
                modalIsOpen={modalIsOpen}
                setModalIsOpen={setModalIsOpen}
            />
            <CreatorList
                NavLeftContent={'专栏管理'}
                NavRightContent={<Button onClick={onCreateColumns} type={'primary'}>新建专栏</Button>}
                ListContent={<ColumnList columns={columns} />}
            />
        </CreatorSideBarLayout>
    </NavLayout>
}

export default ColumnsPage;


type FieldType = {
    column_name?: string;
    description?: string;
    cover_image?: (File & {
        response: {
            msg: 'success' | 'error',
            data: {
                Location: string
            }
        }
    })[]
};

const normFile = (e: FileList) => {
    if (Array.isArray(e) && e.length > 0) {
        return e;
    }
};

const ColumnModal = (props: { modalIsOpen: boolean, setModalIsOpen: (isOpen: boolean) => void }) => {
    const { modalIsOpen, setModalIsOpen } = props;
    const [ formRef ] = Form.useForm<FieldType>();
    const onFinish: FormProps<FieldType>['onFinish'] = (e) => {
        let cover_image
        if(Array.isArray(e.cover_image) && e.cover_image.length > 0) {
            cover_image = e.cover_image[0].response.msg === 'success' ? ('https://' + e.cover_image[0].response.data.Location) : undefined;
        }
        const apiData = {
            column_name: e.column_name,
            description: e.description,
            cover_image,
        }
        apiClient(apiList.post.protected.columns.updateColumn, {
            method: 'POST',
            body: JSON.stringify(apiData),
        }).then(res => {
            console.log(res);
            if (res.msg === 'success') {

            }

        })
    }
    return <Modal
        open={modalIsOpen}
        title={'新建专栏'}
        onOk={() => {
            formRef.submit();
        }}
        onCancel={() => { setModalIsOpen(false) }}
    >
        <Form<FieldType>
            form={formRef}
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            style={{ maxWidth: 600 }}
            onFinish={onFinish}
        >
            <Form.Item
                name='column_name'
                label='专栏名称'
                required
                rules={[{ required: true, message: '专栏名称不能为空' }]}
            >
                <Input maxLength={50} />
            </Form.Item>
            <Form.Item
                label='专栏简介'
                name='description'
                required
                rules={[{ required: true, message: '专栏简介不能为空' }]}
            >
                <Input.TextArea maxLength={200} rows={4} />
            </Form.Item>
            <Form.Item
                name="cover_image"
                label="专栏封面"
                valuePropName="fileList"
                getValueFromEvent={normFile}
            >
                <UploadCover
                    uploadToDir={'columns'}
                />
            </Form.Item>
        </Form>
    </Modal>
}

const ColumnList = (props: { columns: columnsTableType[] }) => {
    const { columns } = props;
    return <div>
        {columns.map(column => {
            console.log(column.cover_image);
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
                                        key: 'delete',
                                        label: '删除',
                                        onClick: () => {},
                                    }
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