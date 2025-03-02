'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import Icon from '../../../../../public/icon/pluginIcon/formula.svg';
import lineFormulaIcon from '../../../../../public/icon/pluginIcon/lineFormula.svg';
import blockFormulaIcon from '../../../../../public/icon/pluginIcon/blockFormula.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Dropdown, MenuProps } from "antd";
import classNames from "classnames";
import {insertToPreAndLast} from "@/components/MdEditor/plugins/utils";

const FormulaPlugin = (props: PluginProps) => {
    const { editor } = props;
    const lineFormulaInsert = () => {
        insertToPreAndLast(editor, "$", "$");
    }
    const blockFormulaInsert = () => {
        insertToPreAndLast(editor, "\n\n$$\n", "\n$$\n");
    }
    const items: MenuProps['items'] = [
        {
            key: 'lineFormula',
            label: <>行内公式</>,
            icon: <PluginIcon defaultIcon={lineFormulaIcon}/>,
            onClick: () => {
                lineFormulaInsert()
            }
        },
        {
            key: 'blockFormula',
            label: <>块公式</>,
            icon: <PluginIcon defaultIcon={blockFormulaIcon}/>,
            onClick: () => {
                blockFormulaInsert()
            }
        }
    ]
    return <Dropdown
        menu={{items}}
    >
            <span
                className={classNames({
                    'button': true,
                    [styles.FormulaPluginPluginContainer]: true,
                })}
            >
                <PluginIcon defaultIcon={Icon} width={17} height={17}/>
            </span>
    </Dropdown>
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
FormulaPlugin.align = 'left';
FormulaPlugin.pluginName = 'FormulaPlugin';


export default FormulaPlugin;