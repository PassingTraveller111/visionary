'use client'
import styles from './index.module.scss';
import RootPlugins from "@/components/Diagram/DiagramHeader/Plugins/RootPlugins";
import {Button, Input} from "antd";
import {Profile} from "@/components/Profile";
import React from "react";
import {diagramType} from "@/store/features/diagramSlice";


type DiagramHeaderProps = {
    diagram: diagramType;
    onSaveDiagram: () => void;
    onTitleChange: (title: string) => void;
}

const DiagramHeader = ({ diagram, onSaveDiagram, onTitleChange }: DiagramHeaderProps) => {

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