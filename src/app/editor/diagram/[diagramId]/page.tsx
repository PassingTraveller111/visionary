'use client'
import Diagram from "@/components/Diagram";
import styles from './index.module.scss';
import DiagramHeader from "../../../../components/Diagram/DiagramHeader";
import DiagramToolBar from "../../../../components/Diagram/DiagramSideBar";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import { useCallback, useEffect } from "react";
import {useDispatch} from "react-redux";
import {AppDispatch, useAppSelector} from "@/store";
import {setDiagram} from "@/store/features/diagramSlice";
import {useGetDiagram, useUpdateDiagram} from "@/hooks/diagrams/useDiagram";
import useStore from "@/components/Diagram/store";
import useMessage from "antd/es/message/useMessage";
import {getNodesBounds, getViewportForBounds, ReactFlowProvider, useReactFlow} from "@xyflow/react";
import {toPng} from "html-to-image";
import {apiClient, apiList} from "@/clientApi";

const DiagramPage = () => {
    return <ReactFlowProvider>
        <DiagramContainer/>
    </ReactFlowProvider>
}

const DiagramContainer = () => {
    const diagramId = useParams().diagramId;
    const type = useSearchParams().get('type');
    const dispatch = useDispatch<AppDispatch>();
    const diagram = useAppSelector(state => state.rootReducer.diagramReducer.value);
    const updateDiagram = useUpdateDiagram();
    const getDiagram = useGetDiagram();
    const { getNodes } = useReactFlow();
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
    // 修改title
    const onTitleChange = (title: string) => {
        dispatch(setDiagram({
            ...diagram,
            title,
        }))
    }
    // 保存为图片
    const saveAsImage = async () => {
        const imageWidth = 1024;
        const imageHeight = 768;
        const nodesBounds = getNodesBounds(getNodes());
        const viewport = getViewportForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            0.5,
            2,
            0,
        );
        const element = document.querySelector('.react-flow__viewport');
        if(!element) return;
        return await toPng(element as HTMLElement, {
            backgroundColor: 'transparent',
            width: imageWidth,
            height: imageHeight,
            style: {
                width: imageWidth.toString(),
                height: imageHeight.toString(),
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            },
        });
    };
    // 保存到数据库
    const onSaveDiagram = async () => {
        const data = getData(); // 图表数据要从图表的独立store获取
        // 根据当前的图像生成新的封面
        const base64 = await saveAsImage();
        if (!base64) return;
        const file =  base64ToFile(base64, diagram.title);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', diagram.id.toString());
        const res = await apiClient(apiList.post.protected.diagrams.uploadCover, {
            method: 'POST',
            body: formData,
        });
        const newCover = `https://${res.data.Location}`;
        updateDiagram({
            ...diagram,
            data: JSON.stringify(data),
            cover: newCover,
        }, userInfo).then((res) => {
            if(res.msg === 'success') {
                messageApi.success('保存成功');
            }else{
                messageApi.error('保存失败');
            }
        })
    }
    return <div className={styles.DiagramContainer}>
        {messageContext}
        <div className={styles.Header}>
            <DiagramHeader
                diagram={diagram}
                onSaveDiagram={onSaveDiagram}
                onTitleChange={onTitleChange}
                onSaveAsImage={saveAsImage}
            />
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


function base64ToFile(base64Data: string, fileName: string) {
    const sliceSize = 512;
    const byteCharacters = atob(base64Data.split(',')[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: 'image/png' });

    return new File([blob], fileName + '.png', { type: 'image/png' });
}