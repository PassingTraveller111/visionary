'use client'
import styles from './index.module.scss';
import RootPlugins from "@/components/Diagram/DiagramHeader/Plugins/RootPlugins";
import {Button, Input} from "antd";
import {Profile} from "@/components/Profile";
import React from "react";
import {diagramType} from "@/store/features/diagramSlice";
import {getNodesBounds, getViewportForBounds, useReactFlow} from "@xyflow/react";
import {toPng} from "html-to-image";


type DiagramHeaderProps = {
    diagram: diagramType;
    onSaveDiagram: () => void;
    onTitleChange: (title: string) => void;
}

const imageWidth = 1024;
const imageHeight = 768;

const DiagramHeader = ({ diagram, onSaveDiagram, onTitleChange }: DiagramHeaderProps) => {
    const { getNodes } = useReactFlow();
    const saveAsImage = async () => {
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
    const downloadImage = () => {
        saveAsImage().then((dataUrl) => {
            if(!dataUrl) return;
            const a = document.createElement('a');
            a.setAttribute('download', `${diagram.title}.png`);
            a.setAttribute('href', dataUrl);
            a.click();
        })
    }
    return <div className={styles.HeaderContainer}>
        <div
            className={styles.header}
        >
            <div className={styles.left}>
                <Input
                    className={styles.title}
                    maxLength={100}
                    value={diagram.title}
                    onChange={(e) => onTitleChange(e.target.value)}
                />
            </div>
            <div className={styles.right}>
                <Button type='primary' onClick={downloadImage}>导出</Button>
                <Button type='primary' onClick={onSaveDiagram}>保存</Button>
                <Profile/>
            </div>
        </div>
        <div
            className={styles.toolbar}
        >
            <div className={styles.toolbarLeft}>
                {
                    RootPlugins
                        .filter(Plugin => Plugin.config.align === 'left')
                        .map((Plugin) => {
                            return <Plugin key={Plugin.name}/>
                        })
                }
            </div>
            <div className={styles.toolbarRight}>
                {
                    RootPlugins
                        .filter(Plugin => Plugin.config.align === 'right')
                        .map((Plugin) => {
                            return <Plugin key={Plugin.name}/>
                        })
                }
            </div>
        </div>
    </div>
}


export default DiagramHeader;