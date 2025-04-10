"use client"
import React from "react";
import styles from "./index.module.scss";
import {Button, Dropdown, Menu, MenuProps} from "antd";
import {useRouter} from "next/navigation";
import {IconFont} from "@/components/IconFont";

type CreatorSideBarLayoutProps = {
    children: React.ReactNode;
    selectedMenuKey: menuKeyType;
}

type menuKeyType = 'home' | 'article' | 'draft' | 'columns';

const items: MenuProps['items'] = [
    {
        label: '新建文章',
        key: 'draft',
        icon: <IconFont type='icon-article'/>,
        onClick: () => {
            window.open('/editor/draft/new', '_blank');
        }
    },
    {
        label: '新建图表',
        key: 'diagram',
        icon: <IconFont type='icon-diagram'/>,
        onClick: () => {
            window.open('/editor/diagram/new', '_blank');
        }
    },
];

const CreatorSideBarLayout = (props: CreatorSideBarLayoutProps) => {
    const { children, selectedMenuKey } = props;

    return <div className={styles.creatorSideBarLayout}>
        <div className={styles.sideBar}>
            <div className={styles.sideBarContent}>
                <Dropdown
                    menu={{ items }}
                >
                    <Button
                        className={styles.createButton}
                        type="primary"
                    >
                        创作<IconFont type='icon-bottomArrow'/>
                    </Button>
                </Dropdown>

                <SideBarMenu defaultSelectedKeys={[ selectedMenuKey ]} />
            </div>
        </div>
        <div className={styles.content}>
            {children}
        </div>
    </div>
}

type MenuItem = Required<MenuProps>['items'][number];


const SideBarMenu = (props: { defaultSelectedKeys: string[] }) => {
    const { defaultSelectedKeys } = props;
    const router = useRouter();
    const items: MenuItem[] = [
        {
            key: 'home',
            label: '首页',
        },
        {
            key: 'content',
            label: '创作管理',
            children: [
                { key: 'article', label: '文章管理' },
                { key: 'draft', label: '草稿管理' },
                { key: 'columns', label: '专栏管理' },
            ],
        },
    ];
    const onClick = (e: { keyPath: string[] }) => {
        const { keyPath } = e;
        const path = '/creator/' + keyPath.reverse().join('/');
        router.push(path);
    }
    return <Menu
        onClick={onClick}
        style={{ width: '100%' }}
        defaultSelectedKeys={defaultSelectedKeys}
        defaultOpenKeys={['content']}
        mode="inline"
        items={items}
    />
}

export default CreatorSideBarLayout;