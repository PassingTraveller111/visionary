'use client'
import React, {useCallback, useState} from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import Icon from '../../../../../public/icon/pluginIcon/table.svg';
import PluginIcon from "@/components/MdEditor/PluginIcon";
import {Popover, Tooltip} from "antd";
import classNames from "classnames";
import {insertInPoint} from "@/components/MdEditor/plugins/utils";

const TablePlugin = (props: PluginProps) => {
    const { editor } = props;
    const insert = (table: string) => {
        insertInPoint(editor, table);
    }
    return <>
        <Tooltip
            title='表格'
        >
            <Popover
                content={<>
                    {<TableCreate onCreatTable={insert} />}
                </>}
                placement='bottomLeft'
            >
                <span
                    className={classNames({
                        'button': true,
                        [styles.LinkPluginContainer]: true,
                    })}
                >
                    <PluginIcon defaultIcon={Icon} width={17} height={17}/>
                </span>
            </Popover>
        </Tooltip>
    </>

}
// 如果需要的话，可以在这里定义默认选项
// SavePlugin.defaultConfig = {
//     articleId: 'new',
// }
TablePlugin.align = 'left';
TablePlugin.pluginName = 'TablePlugin';


export default TablePlugin;


const TableCreate = (props: { rowCount?: number, colCount?: number, onCreatTable: (table: string) => void }) => {
    const { colCount = 6, rowCount = 4, onCreatTable } = props;
    const [isHover, setIsHover] = useState(false);
    const [hoverIndex, setHoverIndex] = useState<number | null>(null);
    const squareWidth = 20, squareHeight = 20;
    const marginWidth = 4;
    // 生成 Markdown 表格的函数
    const  createTable = useCallback((rows: number, columns: number) => {
        // 换行
        let table = '\n';

        // 生成表头
        let header = '|';
        for (let i = 1; i <= columns; i++) {
            header += ` Column ${i} |`;
        }
        table += header + '\n';

        // 生成表格分隔线
        let separator = '|';
        for (let i = 1; i <= columns; i++) {
            separator += ' --- |';
        }
        table += separator + '\n';

        // 生成表格内容
        for (let i = 1; i <= rows; i++) {
            let row = '|';
            for (let j = 1; j <= columns; j++) {
                row += ` Cell ${i}-${j} |`;
            }
            table += row + '\n';
        }

        // 换行
        table += '\n';

        return table;
    }, []);
    const squares = Array.from({ length: (rowCount * colCount) }, (_, index) => (
        <div
            key={index}
            className={styles.square}
            style={{
                width: squareWidth,
                height: squareHeight,
                marginTop: (index < colCount ? 0 : marginWidth) + 'px',
                marginLeft: (index % colCount === 0 ? 0 : marginWidth) + 'px',
                background: isHover
                    && hoverIndex
                    && (Math.floor(hoverIndex / colCount) >= Math.floor(index / colCount)) // 行号
                    && (hoverIndex % colCount >= index % colCount) // 列号
                    ? '#8f8f91'
                    : '#cdcdcf'
            }}
            onMouseEnter={() => {
                setHoverIndex(index);
            }}
            onClick={() => {
                onCreatTable(createTable(
                    Math.floor(index / colCount) + 1,
                    index % rowCount + 1,
                ));
            }}
        ></div>
    ));
    return <div
        className={styles.squareContainer}
        style={{
            width: colCount * squareWidth + (colCount - 1) * marginWidth,
        }}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
    >
        {squares}
    </div>
}