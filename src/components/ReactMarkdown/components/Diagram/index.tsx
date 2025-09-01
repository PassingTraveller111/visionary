import {ComponentType} from "@/components/ReactMarkdown/components/type";
import {useGetDiagramCoverById} from "@/hooks/diagrams/useDiagram";
import {useEffect, useState} from "react";
import { Image } from "antd";
import styles from './index.module.scss';
import {useIsUserOwn} from "@/hooks/users/useUsers";

const DiagramComponents: ComponentType  = ({children}) => {
    const getDiagramCoverById = useGetDiagramCoverById();
    const [diagram, setDiagram] = useState({
        id: 0,
        title: '',
        cover: '',
        author_id: 0,
    });
    const isUserOwn = useIsUserOwn();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // 假设 children.props.className 的值为 "luanguage-diagram?id=17"
    const targetClassName = children && children.props.className || "";
    const idMatch = /\?id=(\w+)/.exec(targetClassName);
    const idValue = idMatch ? idMatch[1] : "";
    useEffect(() => {
        getDiagramCoverById(Number(idValue)).then(res => {
            if(res)
            setDiagram(res);
            else {
                setDiagram({
                    id: 0,
                    title: '',
                    cover: '',
                    author_id: 0,
                })
            }
        })
    }, [getDiagramCoverById, idValue]);
    const handleOpen = (id: number) => {
        window.open('/editor/diagram/' + id, '_blank');
    }
    return(
        <div
            className={styles.diagramContainer}
        >
            <div className={styles.diagramHeader}>
                <div className={styles.headerLeft}>{diagram.title}</div>
                {isUserOwn(diagram.author_id) && <div
                    className={styles.editButton}
                    onClick={() => handleOpen(diagram.id)}
                >编辑</div>}
            </div>
            {diagram.id !== 0 && <Image src={diagram.cover} alt={''}/>}
        </div>
    )
}

export default DiagramComponents;