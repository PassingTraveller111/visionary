"use client"
import styles from './index.module.scss';
import {Button, Checkbox, Form, FormProps, Input, Tabs, TabsProps} from "antd";

type FieldType = {
    username: string
    password: string
    isRemember: boolean
}

const Index = (props: {
    onLogin: (username: string, password: string, isRemember: boolean) => Promise<{
        status: number
        message: string
    }>;
}) => {
    const { onLogin } = props;
    const [ form ]= Form.useForm<FieldType>();
    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const res = await onLogin(values.username, values.password, values.isRemember);
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
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: '账号登录',
            children: <>
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
                        <Button block type="primary" htmlType="submit">
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </>,
        },
        {
            key: '2',
            label: '手机号登录',
            children: 'Content of Tab Pane 2',
            disabled: true,
        },
    ];
    const onChange = (key: string) => {
        console.log(key);
    }
    return <div className={styles.container}>
        <div className={styles.form}>
            <Tabs
                defaultActiveKey="1"
                centered
                items={items}
                onChange={onChange}
                indicator={{ size: (origin) => origin - 20, align: 'center' }}
            />
        </div>
    </div>
}

export default Index;