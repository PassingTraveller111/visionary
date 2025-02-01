'use client'
import NavLayout from "@/components/NavLayout";
import {Button, Divider, Form, FormProps, Input, message} from "antd";
import {useAppSelector} from "@/store";
import styles from "./index.module.scss";
import {apiClient, apiList} from "@/clientApi";
import {useGetUserInfo} from "@/hooks/users/useUsers";
import EditAvatar from "../../../components/EditAvatar";
import Upload from "@/components/Upload";

type FieldType = {
    nick_name?: string;
}

const MyDataPage = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const [messageApi, contextHolder] = message.useMessage();
    const getUserInfo = useGetUserInfo();
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const res = await apiClient(apiList.post.protected.user.updateUserInfo, {
            method: 'POST',
            body: JSON.stringify(values),
        })
        if (res.msg === 'success') {
            messageApi.success('保存成功');
        }
        if (res.msg === 'error') {
            messageApi.error('保存失败');
        }
        getUserInfo();
    }
    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (values) => {
        console.log('values', values);
    }
    return <>
        {contextHolder}
        <NavLayout>
            <div className={styles['profile-container']}>
                <div className={styles['profile-content']}>
                    <span className={styles['profile-title']}>个人资料：</span>
                    <Divider />
                    <div className={styles['profile-edit']}>
                        <div className={styles['profile-left']}>
                            {userInfo.login && <Form
                                name="basic"
                                labelCol={{span: 4}}
                                wrapperCol={{span: 16}}
                                style={{maxWidth: 600}}
                                onFinish={onFinish}
                                onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >
                                <Form.Item<FieldType>
                                    label='昵称'
                                    name='nick_name'
                                    rules={[{required: true, message: '昵称不可以为空!'}]}
                                    initialValue={userInfo.nick_name}
                                >
                                    <Input/>
                                </Form.Item>
                                <Form.Item label={null}>
                                    <Button type="primary" htmlType="submit">
                                        保存
                                    </Button>
                                </Form.Item>
                            </Form>
                            }
                        </div>
                        <div className={styles['profile-right']}>
                            <EditAvatar />
                        </div>
                    </div>
                </div>
            </div>
        </NavLayout>
    </>
}

export default MyDataPage;