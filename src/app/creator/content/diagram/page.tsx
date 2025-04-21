"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import {Modal, message, Card, Flex, Dropdown} from "antd";
import {useAppSelector} from "@/store";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import CreatorList from "@/components/CreatorList";
import {useGetDiagramsList} from "@/hooks/diagrams/useDiagram";
import {IconFont} from "@/components/IconFont";
import Image from "next/image";



const DiagramPage = () => {
    const { id: userId, isLoading } = useAppSelector(state => state.rootReducer.userReducer.value);
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [diagramsList] = useGetDiagramsList();
    const handleOpen = (id: number) => {
        window.open('/editor/diagram/' + id, '_blank');
    }
    return <>
        {modalContextHolder}
        {messageContextHolder}
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
                                                    diagram?.cover &&  <Image
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
                                                                    }
                                                                },
                                                                {
                                                                    key: 'remove',
                                                                    label: '删除',
                                                                    onClick: ({ domEvent }) => {
                                                                        domEvent.stopPropagation();
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






export default DiagramPage;

