'use client'
import NavLayout from "@/components/NavLayout";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import CreatorList from "@/components/CreatorList";
import {Button, Form, FormProps, Input, Modal} from "antd";
import UploadCover from "@/components/UploadCover";
import {useState} from "react";
import {apiClient, apiList} from "@/clientApi";

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

const ColumnsPage = () => {
    const [ modalIsOpen, setModalIsOpen ] = useState(false);
    const [ formRef ] = Form.useForm<FieldType>();
    const onFinish: FormProps<FieldType>['onFinish'] = (e) => {
        console.log("onFinish", e);
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
    const onCreateColumns = () => {
        setModalIsOpen(true);
    }
    return <NavLayout>
        <CreatorSideBarLayout
            selectedMenuKey='columns'
        >
            <Modal
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
            <CreatorList
                NavLeftContent={'专栏管理'}
                NavRightContent={<Button onClick={onCreateColumns} type={'primary'}>新建专栏</Button>}
                ListContent={<div>
                    111
                </div>}
            />
        </CreatorSideBarLayout>
    </NavLayout>
}

export default ColumnsPage;
