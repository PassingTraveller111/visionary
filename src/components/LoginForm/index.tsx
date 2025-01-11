"use client"
import styles from './index.module.scss';
import {Button, Input, Tabs, TabsProps} from "antd";
import { useState } from "react";

const Index = (props: {
    onLogin: (username: string, password: string) => void;
}) => {
    const { onLogin } = props;
    const [ username, setUsername ] = useState("admin");
    const [ password, setPassword ] = useState("123456");
    const items: TabsProps['items'] = [
        {
            key: '1',
            label: '账号登录',
            children: <>
                <div>
                    账号
                    <Input value={username} onChange={(e) => {
                        setUsername(e.target.value);
                    }} />
                </div>
                <div>
                    密码
                    <Input value={password} onChange={(e) => {
                        setPassword(e.target.value);
                    }}/>
                </div>
                <div>
                    <Input type='checkbox' />记住密码
                </div>
                <div>
                    <Button onClick={() => {
                        onLogin(username, password)
                    }}>登录</Button>
                </div>
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
                items={items}
                onChange={onChange}
                indicator={{ size: (origin) => origin - 20, align: 'center' }}
            />
        </div>
    </div>
}

export { Index };