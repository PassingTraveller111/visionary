'use client'
import Diagram from "@/components/Diagram";
import styles from './index.module.scss';
import DiagramHeader from "../../../../components/Diagram/DiagramHeader";
import DiagramToolBar from "../../../../components/Diagram/DiagramSideBar";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {useCallback, useEffect} from "react";
import {useDispatch} from "react-redux";
import {AppDispatch, useAppSelector} from "@/store";
import {setDiagram} from "@/store/features/diagramSlice";
import {useGetDiagram, useUpdateDiagram} from "@/hooks/diagrams/useDiagram";

const DiagramPage = () => {
    const diagramId = useParams().diagramId;
    const type = useSearchParams().get('type');
    const dispatch = useDispatch<AppDispatch>();
    const diagram = useAppSelector(state => state.rootReducer.diagramReducer.value);
    const updateDiagram = useUpdateDiagram();
    const getDiagram = useGetDiagram();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const router = useRouter();
    const initDiagram = useCallback(() => {
        const id = diagramId === 'new' ? diagramId : Number(diagramId);
        dispatch(setDiagram({
            ...diagram,
            id,
        }));
        if (typeof id === 'number') {
            // 获取图表数据
            getDiagram(id);
        } else {
            // 新建图表
            updateDiagram(diagram, userInfo).then((res) => {
                router.push('/editor/diagram/' + res.id);
            })
        }
    }, [diagram, diagramId, dispatch, updateDiagram, userInfo]);

    useEffect(() => {
        if(userInfo.id === 0) return;
        initDiagram();
    }, [userInfo.id]);
    return <div className={styles.DiagramContainer}>
        <div className={styles.Header}>
            <DiagramHeader/>
        </div>
        <div className={styles.Diagram}>
            <DiagramToolBar/>
            <div className={styles.center}>
                <Diagram/>
            </div>
            <div className={styles.right}>

            </div>
        </div>
    </div>
}


export default DiagramPage;