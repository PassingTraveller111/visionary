'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import classNames from "classnames";
import SaveIcon from '../../../../../public/icon/pluginIcon/save.svg';
import {useUpdateArticle} from "@/hooks/articles/useArticles";
import PluginIcon from "@/components/MdEditor/PluginIcon";
import SaveHoverIcon from "../../../../../public/icon/pluginIcon/saveHover.svg";
import {Tooltip, message} from "antd";

const SavePlugin = (props: PluginProps) => {
    const updateArticle = useUpdateArticle();
    const [messageApi, contextHolder] = message.useMessage();
    const handleClick = async () => {
        const newMdValue = props.editor.getMdValue();
        const res = await updateArticle(newMdValue);
        if (res.msg === "success") {
            messageApi.success('保存成功');
        }
    }
    return (
        <Tooltip
            title="保存"
        >
            {contextHolder}
            <span
                className={classNames({
                    'button': true,
                    [styles.SavePluginContainer]: true,
                })}
                onClick={handleClick}
            >
                <PluginIcon defaultIcon={SaveIcon} hoverIcon={SaveHoverIcon}/>
            </span>
        </Tooltip>
    );
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
SavePlugin.align = 'left';
SavePlugin.pluginName = 'counter';


export default SavePlugin;