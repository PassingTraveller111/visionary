'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import Icon from '../../../../../public/icon/pluginIcon/quote.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import { Tooltip } from "antd";
import classNames from "classnames";
import { insertToSelectLinePrevious } from "@/components/MdEditor/plugins/utils";

const QuotePlugin = (props: PluginProps) => {
    const { editor } = props;
    const insertQuote = () => {
        insertToSelectLinePrevious(editor, '> ');
    }
    return <Tooltip
        title='引用'
    >
        <span className={classNames({
            'button': true,
            [styles.QuotePluginContainer]: true,
        })}
              onClick={() => {
                  insertQuote();
              }}
        >
            <PluginIcon defaultIcon={Icon} />
        </span>
    </Tooltip>
}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
QuotePlugin.align = 'left';
QuotePlugin.pluginName = 'QuotePlugin';


export default QuotePlugin;