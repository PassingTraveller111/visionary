'use client'
import React, {forwardRef, useImperativeHandle, useRef, useState} from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import diagramIcon from '../../../../../public/icon/pluginIcon/diagram.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import {Button, Divider, Dropdown, Flex, MenuProps, Modal} from "antd";
import classNames from "classnames";
import {useGetDiagramsList, useUpdateDiagram} from "@/hooks/diagrams/useDiagram";
import {AppDispatch, useAppSelector} from "@/store";
import {useDispatch} from "react-redux";
import {setDraft} from "@/store/features/draftSlice";
import Image from "next/image";
import {IconFont} from "@/components/IconFont";

const DiagramPlugin = (props: PluginProps) => {
    const { editor } = props;
    const createDiagramModalRef = useRef<CreateDiagramModalRef>(null);
    const insertDiagramModalRef = useRef<InsertDiagramModalRef>(null);
    const dispatch = useDispatch<AppDispatch>();
    const setIsLoading = (isLoading: boolean) => {
        dispatch(setDraft(
            {
                isLoading,
            }
        ))
    }
    const insertDiagram = (diagramId: number) => {
        editor.insertText(`\n\`\`\`diagram?id=${diagramId}\n\`\`\`\n`);
    }
    const items: MenuProps['items'] = [
        {
            key: 'new',
            label: <span
                onClick={() => {
                    if(createDiagramModalRef.current) createDiagramModalRef.current.openModal();
                }}
            >新建图表</span>
        },
        {
            key: 'insert',
            label: <span
                onClick={() => {
                    if(insertDiagramModalRef.current) insertDiagramModalRef.current.openModal();
                }}
            >插入图表</span>
        }
    ]

    return <>
        <CreateDiagramModal
            ref={createDiagramModalRef}
            setIsLoading={setIsLoading}
            insertDiagram={insertDiagram}
        />
        <InsertDiagramModal
            ref={insertDiagramModalRef}
            insertDiagram={insertDiagram}
        />
        <Dropdown
            menu={{items}}
        >
            <span className={classNames({
                'button': true,
                [styles.DiagramPluginContainer]: true,
            })}>
                <PluginIcon defaultIcon={diagramIcon} />
            </span>
        </Dropdown>
    </>
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
DiagramPlugin.align = 'left';
DiagramPlugin.pluginName = 'DiagramPlugin';


export default DiagramPlugin;

type CreateDiagramModalRef = {
    openModal: () => void;
}
type CreateDiagramModalProps = {
    setIsLoading: (isLoading: boolean) => void
    insertDiagram: (diagramId: number) => void
}

const CreateDiagramModal = forwardRef<CreateDiagramModalRef, CreateDiagramModalProps>(function CreateDiagramModal(props, ref){
    const { setIsLoading, insertDiagram } = props;
    const updateDiagram = useUpdateDiagram();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const [open, setOpen] = useState(false);
    const openModal = () => {
        setOpen(true);
    };
    useImperativeHandle(ref, () => ({
        openModal,
    }));
    const onCreate = (type: 'flow' | 'mindMap') => {
        setOpen(false);
        setIsLoading(true);
        updateDiagram({
            id: 'new',
            type,
            intro: '',
            tags: [],
            title: '新建图表',
            data: '',
            author_id: userInfo.id,
            cover: '',
            create_time: "",
            update_time: "",
        }, userInfo).then(res => {
            if (typeof res.id === 'number') insertDiagram(res.id);
            setTimeout(() => {
                setIsLoading(false);
            })
        })
    }
    return <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={'新建图表'}
    >
        <Button
            onClick={() => {
                onCreate('flow');
            }}
        >新建流程图</Button>
        <Divider/>
        <Button
            onClick={() => {
                onCreate('mindMap');
            }}
        >新建思维导图</Button>
    </Modal>
})

type InsertDiagramModalRef = {
    openModal: () => void;
}
type InsertDiagramModalProps = {
    insertDiagram: (diagramId: number) => void
}

const InsertDiagramModal = forwardRef<InsertDiagramModalRef, InsertDiagramModalProps>(function InsertDiagramModal(props, ref){
    const { insertDiagram } = props;
    const [diagramsList] = useGetDiagramsList();

    const [open, setOpen] = useState(false);
    const openModal = () => {
        setOpen(true);
    };
    useImperativeHandle(ref, () => ({
        openModal,
    }));

    const onInsert = (id: number) => {
        insertDiagram(id);
        setOpen(false);
    }
    return <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title={'选择插入图表'}
        width={650}
        footer={null}
    >
        <Flex
            className={styles.CardContainer}
            wrap gap="small"
        >
            {diagramsList.map(diagram => {
                return <div
                    key={diagram.id}
                    className={styles.CardItem}
                    onClick={() => onInsert(diagram.id)}
                >
                    <div
                        className={styles.Card}
                    >
                        {
                            diagram?.cover && <Image
                                src={diagram?.cover ?? ''}
                                alt={''}
                                width={180}
                                height={180}
                            />
                        }
                    </div>
                    <div className={styles.bottom}>
                        <IconFont type={'icon-diagram'}/>
                        <span className={styles.title}>{diagram.title}</span>
                    </div>
                </div>
            })}
        </Flex>
    </Modal>
})
