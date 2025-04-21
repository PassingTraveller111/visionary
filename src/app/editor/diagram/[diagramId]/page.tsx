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
import useStore from "@/components/Diagram/store";
import useMessage from "antd/es/message/useMessage";

const DiagramPage = () => {
    const diagramId = useParams().diagramId;
    const type = useSearchParams().get('type');
    const dispatch = useDispatch<AppDispatch>();
    const diagram = useAppSelector(state => state.rootReducer.diagramReducer.value);
    const updateDiagram = useUpdateDiagram();
    const getDiagram = useGetDiagram();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const router = useRouter();
    const getData = useStore(state => state.getData);
    const [messageApi, messageContext] = useMessage();
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

    const onSaveDiagram = () => {
        const data = getData(); // 图表数据要从图表的独立store获取
        updateDiagram({
            ...diagram,
            data: JSON.stringify(data),
        }, userInfo).then((res) => {
            if(res.msg === 'success') {
                messageApi.success('保存成功');
            }else{
                messageApi.error('保存失败');
            }
        })
    }
    const onTitleChange = (title: string) => {
        dispatch(setDiagram({
            ...diagram,
            title,
        }))
    }
    return <div className={styles.DiagramContainer}>
        {messageContext}
        <div className={styles.Header}>
            <DiagramHeader diagram={diagram} onSaveDiagram={onSaveDiagram} onTitleChange={onTitleChange} />
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