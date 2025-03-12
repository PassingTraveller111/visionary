"use client"
import styles from './index.module.scss';
import {Button, Checkbox, Form, FormProps, Input, Tabs, TabsProps} from "antd";
import { useState } from "react";
import {apiClient, apiList} from "@/clientApi";
import useMessage from "antd/es/message/useMessage";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useDispatch} from "react-redux";
import {logIn} from "@/store/features/userSlice";
import {IconFont} from "@/components/IconFont";

type FieldType = {
    username: string
    password: string
    isRemember: boolean
    verificationCode: string
}



const Index = (props: {
    onLogin: (username: string, password: string, isRemember: boolean) => Promise<{
        status: number
        message: string
    }>;
}) => {
    const { onLogin } = props;
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: '免密登录',
            children: <NoPassForm />
        },
        {
            key: '2',
            label: '密码登录',
            children: <PassForm onLogin={onLogin} />
        },

    ];
    return <div className={styles.container}>
        <div className={styles.form}>
            <span className={styles.title}>
                <IconFont type={'icon-logo'} />
                创见
            </span>
            <Tabs
                defaultActiveKey="1"
                centered
                items={items}
                indicator={{ size: (origin) => origin - 20, align: 'center' }}
            />
        </div>
    </div>
}

export default Index;

const PassForm = (props: {
    onLogin: (username: string, password: string, isRemember: boolean) => Promise<{
        status: number
        message: string
    }>
}) => {
    const { onLogin } = props;
    const [ form ]= Form.useForm<FieldType>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setIsLoading(true);
        const res = await onLogin(values.username, values.password, values.isRemember);
        setIsLoading(false);
        if(res.status !== 200){
            form.validateFields(['password']).then((values) => {
                form.setFields([
                    {
                        name: 'password',
                        value: values.password,
                        errors: [res.message],
                    },
                ]);
            })
        }
    };
    const onFinishFailed = () => {

    };
    return <>
        <Form
            labelCol={{span: 4}}
            form={form}
            wrapperCol={{span: 16}}
            style={{maxWidth: 600}}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item<FieldType>
                label='用户名'
                name='username'
                rules={[{required: true, message: '用户名不可以为空!'}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item<FieldType>
                label='密码'
                name='password'
                rules={[{required: true, message: '密码不可以为空!'}]}
            >
                <Input.Password/>
            </Form.Item>
            <Form.Item<FieldType> name="isRemember" valuePropName="checked" label={null}>
                <Checkbox>记住密码</Checkbox>
            </Form.Item>
            <Form.Item label={null}>
                <Button
                    block
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                >
                    登录
                </Button>
            </Form.Item>
        </Form>
    </>
}

type noPasswordFieldType = {
    email: string
    verificationCode: string
}
const NoPassForm = () => {
    const [ form ]= Form.useForm<noPasswordFieldType>();
    const dispatch = useDispatch();
    const router = useRouter();
    const [ messageApi, messageContext ] = useMessage();
    const [VCDisable, setVCDisable] = useState(0);
    const [isFirstClick, setIsFirstClick] = useState(true);
    const onFinishNoPassword: FormProps<noPasswordFieldType>['onFinish']  = (values) => {
        const { verificationCode, email } = values;
        apiClient(apiList.post.user.register.verifyCode, {
            method: "POST",
            body: JSON.stringify({
                email,
                code: verificationCode,
            })
        }).then(res => {
            if (res.status !== 200){
                messageApi.error(res.message);
            } else {
                messageApi.success(res.message);
                dispatch(logIn({
                    ...res.data,
                }))
                router.push('/');
            }
        })
    }
    const onGetVerificationCode = () => {
        setIsFirstClick(false);
        setVCDisable(60);
        // 验证码发送逻辑
        const { email } = form.getFieldsValue();
        apiClient(apiList.post.user.register.sendCode, {
            method: "POST",
            body: JSON.stringify({
                email,
            })
        }).then(res => {
            console.log('res', res);
            if (res.status === 200) {
                messageApi.success('邮件已发送');
            } else {
                messageApi.error(res.message);
            }
        })
        const intervalId = setInterval(() => {
            setVCDisable(preTime => {
                if(preTime === 0){
                    clearInterval(intervalId);
                    return 0;
                }
                return preTime - 1;
            });
        }, 1000);
    }
    return <>
        {messageContext}
        <Form
            labelCol={{span: 4}}
            form={form}
            wrapperCol={{span: 16}}
            style={{maxWidth: 600}}
            onFinish={onFinishNoPassword}
            autoComplete="off"
        >
            <Form.Item<noPasswordFieldType>
                label='邮箱'
                name='email'
                rules={[{required: true, message: '邮箱不可以为空!'}]}
            >
                <Input/>
            </Form.Item>
            <Form.Item<noPasswordFieldType>
                label='验证码'
                name='verificationCode'
                rules={[{required: true, message: '验证码不可以为空!'}]}
            >
                <div className={styles.verificationCode}>
                    <Input/>
                    <Button
                        type={'primary'}
                        onClick={onGetVerificationCode}
                        disabled={VCDisable!==0}
                    >
                        {isFirstClick ? '获取验证码' : '重新获取' }
                        {VCDisable !== 0 && VCDisable}
                    </Button>
                </div>
            </Form.Item>
            <Form.Item
                label={null}
            >
                登录或注册即表示同意<Link className={styles.userAgreementLink} href={'/userAgreement'}>用户协议</Link>
            </Form.Item>
            <Form.Item label={null}>
                <Button block type="primary" htmlType="submit">
                    登录/注册
                </Button>
            </Form.Item>
        </Form>
    </>
}