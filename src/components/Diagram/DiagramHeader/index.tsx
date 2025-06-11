'use client'
import styles from './index.module.scss';
import RootPlugins from "@/components/Diagram/DiagramHeader/Plugins/RootPlugins";
import {Button, Input} from "antd";
import {Profile} from "@/components/Profile";
import React, {useMemo} from "react";
import {diagramType} from "@/store/features/diagramSlice";


type DiagramHeaderProps = {
    diagram: diagramType;
    onSaveDiagram: () => void;
    onTitleChange: (title: string) => void;
    onSaveAsImage:  () => Promise<undefined | string>;
    diagramSaveStatus: 'success' | 'error' | 'loading';
}



const DiagramHeader = ({ diagram, onSaveDiagram, onTitleChange, onSaveAsImage, diagramSaveStatus }: DiagramHeaderProps) => {

    const downloadImage = () => {
        onSaveAsImage().then((dataUrl) => {
            if(!dataUrl) return;
            const a = document.createElement('a');
            a.setAttribute('download', `${diagram.title}.png`);
            a.setAttribute('href', dataUrl);
            a.click();
        })
    }

    const status = useMemo(() => {
        switch (diagramSaveStatus) {
            case 'loading': return '正在保存';
            case 'error': return '保存失败';
            case 'success': return '修改已经保存';
        }
    }, [diagramSaveStatus]);

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
                <span className={styles.saveStatus}>{status}</span>
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