'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import titleIcon from '../../../../../public/icon/pluginIcon/title.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import {Dropdown, MenuProps} from "antd";
import classNames from "classnames";
import { insertToSelectLinePrevious } from "@/components/MdEditor/plugins/utils";

const TitlePlugin = (props: PluginProps) => {
    const { editor } = props;
    const insertTitle = (h: number) => {
        const insertText = new Array(h + 1).join('#') + ' ';
        insertToSelectLinePrevious(editor, insertText, ['# ', '## ', '### ', '#### ', '##### ', '###### ']);
    }
    const numToText = ['一', '二', '三', '四', '五', '六']
    const items: MenuProps['items'] = new Array(6).fill(null).map(( _, index) => {
        const num = index + 1;
        return {
            key: num,
            label: (
                <span
                    onClick={() => {
                        insertTitle(num);
                    }}
                >H{num} {numToText[index]}级标题</span>
            ),
        }
    })
    return <Dropdown
            menu={{items}}
        >
            <span className={classNames({
                'button': true,
                [styles.TitlePluginContainer]: true,
            })}>
                <PluginIcon defaultIcon={titleIcon} />
            </span>
        </Dropdown>;
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
TitlePlugin.align = 'left';
TitlePlugin.pluginName = 'TitlePlugin';


export default TitlePlugin;