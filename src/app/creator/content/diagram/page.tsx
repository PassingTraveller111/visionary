"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import { Modal, message, Flex, Dropdown, Input, Button } from "antd";
import { useAppSelector } from "@/store";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import CreatorList from "@/components/CreatorList";
import {useDeleteDiagram, useGetDiagramsList, useRenameDiagram} from "@/hooks/diagrams/useDiagram";
import { IconFont } from "@/components/IconFont";
import Image from "next/image";
import {forwardRef, useImperativeHandle, useRef, useState} from "react";

const DiagramPage = () => {
    const { id: userId, isLoading } = useAppSelector(state => state.rootReducer.userReducer.value);
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [diagramsList, getDiagramsList] = useGetDiagramsList();
    const delDiagram = useDeleteDiagram();
    const renameModalRef = useRef<RenameModalRef>(null);

    const handleOpen = (id: number) => {
        window.open('/editor/diagram/' + id, '_blank');
    }

    const handleDel = (id: number) => {
        delDiagram(id).then(() => {
            getDiagramsList();
        })
    }

    const handleReName = (id: number, initTitle: string) => {
        if(renameModalRef.current) renameModalRef.current.onOpenModal(id, initTitle);
    }

    return <>
        {modalContextHolder}
        {messageContextHolder}
        <RenameModal ref={renameModalRef} getDiagramsList={getDiagramsList}/>
        <NavLayout>
            <CreatorSideBarLayout
                selectedMenuKey='diagram'
            >
                <CreatorList
                    NavLeftContent={'图表管理'}
                    ListContent={
                        <div
                            className={styles.CardContainer}
                        >
                            <Flex wrap gap="small">
                                {
                                    diagramsList.map(diagram => {
                                        return <div
                                            key={diagram.id}
                                            className={styles.CardItem}
                                            onClick={() => handleOpen(diagram.id)}
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

                                                <Dropdown
                                                    placement={'bottomRight'}
                                                    trigger={['click']}
                                                    menu={{
                                                        items: [
                                                            {
                                                                key: 'open',
                                                                label: '打开',
                                                                onClick: ({ domEvent }) => {
                                                                    domEvent.stopPropagation();
                                                                    handleOpen(diagram.id);
                                                                }
                                                            },
                                                            {
                                                                key: 'rename',
                                                                label: '重命名',
                                                                onClick: ({ domEvent }) => {
                                                                    domEvent.stopPropagation();
                                                                    handleReName(diagram.id, diagram.title);
                                                                }
                                                            },
                                                            {
                                                                key:'remove',
                                                                label: '删除',
                                                                onClick: ({ domEvent }) => {
                                                                    domEvent.stopPropagation();
                                                                    modalApi.confirm({
                                                                        title: '删除',
                                                                        content: <>
                                                                            确定要删除<strong>{diagram.title}</strong>吗？
                                                                        </>,
                                                                        onOk: () => {
                                                                            handleDel(diagram.id);
                                                                        }
                                                                    })
                                                                }
                                                            },
                                                        ]
                                                    }}
                                                >
                                                    <div
                                                        className={styles.menu}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                        }}
                                                    >
                                                        <IconFont type={'icon-more'}/>
                                                    </div>
                                                </Dropdown>
                                            </div>
                                            <div className={styles.bottom}>
                                                <IconFont type={'icon-diagram'}/>
                                                <span className={styles.title}>{diagram.title}</span>
                                            </div>
                                        </div>
                                    })
                                }
                            </Flex>
                        </div>
                    }
                />
            </CreatorSideBarLayout>
        </NavLayout>
    </>
}

type RenameModalProps = {
    getDiagramsList: () => void;
}

type RenameModalRef = {
    onOpenModal: (id: number, defaultTitle: string) => void;
}

const RenameModal = forwardRef<RenameModalRef, RenameModalProps>(function RenameModal({ getDiagramsList }, ref) {
    const [title, setTitle] = useState('');
    const [open, setOpen] = useState(false);
    const [id, setId] = useState(0);
    const renameDiagram = useRenameDiagram();
    useImperativeHandle(ref, () => ({
        onOpenModal: (id, defaultTitle) => {
            setOpen(true);
            setTitle(defaultTitle);
            setId(id);
        }
    }));
    return <Modal
        open={open}
        title={'重命名'}
        onOk={() => {
            renameDiagram(title, id).then(() => {
                setOpen(false);
                getDiagramsList();
            })
        }}
        onCancel={() => {
            setOpen(false);
        }}
    >
        <div className={styles.renameInput}>
            <span>名称:</span><Input value={title} onChange={(e) => setTitle(e.target.value)}/>
        </div>
    </Modal>
})

export default DiagramPage;