'use client'
import Diagram from "@/components/Diagram";
import styles from './index.module.scss';
import DiagramHeader from "../../../../components/Diagram/DiagramHeader";
import DiagramToolBar from "../../../../components/Diagram/DiagramSideBar";
import {useParams, useRouter} from "next/navigation";
import {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch} from "react-redux";
import {AppDispatch, useAppSelector} from "@/store";
import {setDiagram} from "@/store/features/diagramSlice";
import {useGetDiagram, useUpdateDiagram} from "@/hooks/diagrams/useDiagram";
import useStore from "@/components/Diagram/store";
import {getNodesBounds, getViewportForBounds, ReactFlowProvider, useReactFlow} from "@xyflow/react";
import {toPng} from "html-to-image";
import {apiClient, apiList} from "@/clientApi";
import {debounce} from "next/dist/server/utils";

const DiagramPage = () => {
    return <ReactFlowProvider>
        <DiagramContainer/>
    </ReactFlowProvider>
}

const DiagramContainer = () => {
    const diagramId = useParams().diagramId;
    const dispatch = useDispatch<AppDispatch>();
    const diagram = useAppSelector(state => state.rootReducer.diagramReducer.value);
    const updateDiagram = useUpdateDiagram();
    const getDiagram = useGetDiagram();
    const { getNodes } = useReactFlow();
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const router = useRouter();
    const getData = useStore(state => state.getData);
    const [diagramSaveStatus, setDiagramSaveStatus] = useState<'success' | 'error' | 'loading'>('success');
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
    }, [diagram, diagramId, dispatch, getDiagram, router, updateDiagram, userInfo]);

    useEffect(() => {
        if(userInfo.id === 0) return;
        initDiagram();
        // Diagram initialization should only run when the active user becomes available.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo.id]);
    // 修改title
    const onTitleChange = (title: string) => {
        dispatch(setDiagram({
            ...diagram,
            title,
        }))
    }
    // 保存为图片
    const saveAsImage = useCallback(async () => {
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
    }, [getNodes]);

    // 保存到数据库
    const onSaveDiagram = useCallback(async () => {
        const data = getData(); // 图表数据要从图表的独立store获取
        // 根据当前的图像生成新的封面
        const base64 = await saveAsImage();
        if (!base64) return false;
        const file =  base64ToFile(base64, diagram.title);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('id', diagram.id.toString());
        const resCover = await apiClient(apiList.post.protected.diagrams.uploadCover, {
            method: 'POST',
            body: formData,
        });
        const newCover = `https://${resCover.data.Location}`;

        return await updateDiagram({
            ...diagram,
            data: JSON.stringify(data),
            cover: newCover,
        }, userInfo);
    }, [diagram, getData, saveAsImage, updateDiagram, userInfo]);

    const debounceSaveRef = useRef(null);
    // 初始化防抖函数
    useEffect(() => {
        // 创建防抖函数，接收最新的draft和userInfo作为参数
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        debounceSaveRef.current = debounce(async () => {
            try {
                setDiagramSaveStatus('loading');
                const res = await onSaveDiagram();
                if(res && res.msg === 'success')
                    setDiagramSaveStatus('success');
                else setDiagramSaveStatus('error');
            } catch (error) {
                console.error('保存失败:', error);
                setDiagramSaveStatus('error');
            }
        }, 2000);
    }, [onSaveDiagram]);

    const debounceOnSave = useCallback(async () => {
        if (debounceSaveRef.current) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return await debounceSaveRef.current();
        }
    },[])

    return <div className={styles.DiagramContainer}>
        <div className={styles.Header}>
            <DiagramHeader
                diagram={diagram}
                diagramSaveStatus={diagramSaveStatus}
                onSaveDiagram={debounceOnSave}
                onTitleChange={onTitleChange}
                onSaveAsImage={saveAsImage}
            />
        </div>
        <div className={styles.Diagram}>
            <DiagramToolBar/>
            <div className={styles.center}>
                <Diagram
                    onSaveDiagram={debounceOnSave}
                />
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
