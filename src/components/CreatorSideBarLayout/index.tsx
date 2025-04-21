"use client"
import React, {forwardRef, useImperativeHandle, useMemo, useRef, useState} from "react";
import styles from "./index.module.scss";
import {Button, Divider, Dropdown, Menu, MenuProps, Modal} from "antd";
import {useRouter} from "next/navigation";
import {IconFont} from "@/components/IconFont";

type CreatorSideBarLayoutProps = {
    children: React.ReactNode;
    selectedMenuKey: menuKeyType;
}

type menuKeyType = 'home' | 'article' | 'draft' | 'columns' | 'diagram';



const CreatorSideBarLayout = (props: CreatorSideBarLayoutProps) => {
    const { children, selectedMenuKey } = props;
    const createDiagramModalRef = useRef<CreateDiagramModalRef>(null);
    const items: MenuProps['items'] = useMemo(() => [
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
                if(createDiagramModalRef.current) createDiagramModalRef.current.openModal();
            }
        },
    ], []);
    return <>
        <CreateDiagramModal ref={createDiagramModalRef}/>
        <div className={styles.creatorSideBarLayout}>
            <div className={styles.sideBar}>
                <div className={styles.sideBarContent}>
                    <Dropdown
                        menu={{items}}
                    >
                        <Button
                            className={styles.createButton}
                            type="primary"
                        >
                            创作<IconFont type='icon-bottomArrow'/>
                        </Button>
                    </Dropdown>
                    <SideBarMenu defaultSelectedKeys={[selectedMenuKey]}/>
                </div>
            </div>
            <div className={styles.content}>
                {children}
            </div>
        </div>
    </>
}

type MenuItem = Required<MenuProps>['items'][number];


const SideBarMenu = (props: { defaultSelectedKeys: string[] }) => {
    const {defaultSelectedKeys} = props;
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
                {key: 'article', label: '文章管理'},
                {key: 'draft', label: '草稿管理'},
                {key: 'columns', label: '专栏管理'},
                {key: 'diagram', label: '图表管理'},
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

type CreateDiagramModalRef = {
    openModal: () => void;
}

const CreateDiagramModal = forwardRef<CreateDiagramModalRef>(function CreateDiagramModal(props, ref){
    const [open, setOpen] = useState(false);
    const openModal = () => {
        setOpen(true);
    };
    useImperativeHandle(ref, () => ({
        openModal
    }));
    const onOpen = (type: 'flow' | 'mindMap') => {
        window.open(`/editor/diagram/new?type=${type}`, '_blank');
    }
    return <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        title={'新建图表'}
    >
        <Button
            onClick={() => {
                onOpen('flow');
            }}
        >新建流程图</Button>
        <Divider/>
        <Button
            onClick={() => {
                onOpen('mindMap');
            }}
        >新建思维导图</Button>
    </Modal>
})

export default CreatorSideBarLayout;