'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import Image from "next/image";
import styles from './index.module.scss';
import classNames from "classnames";
import SaveIcon from '../../../../../public/save.svg';
import {useUpdateArticle} from "@/hooks/articles/useArticles";

const SavePlugin = (props: PluginProps) => {
    const updateArticle = useUpdateArticle();
    const handleClick = async () => {
        const newMdValue = props.editor.getMdValue();
        const res = await updateArticle(newMdValue);
        console.log(res);
    }
    return (
        <span
            className={classNames({
                'button': true,
                [styles.SavePluginContainer]: true,
            })}
            title="保存"
            onClick={handleClick}
        >
            <Image src={SaveIcon} alt='save' width={18} height={18.5} />
    </span>
    );
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
SavePlugin.align = 'left';
SavePlugin.pluginName = 'counter';


export default SavePlugin;