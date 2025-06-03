import styles from './index.module.scss';
import {useEffect, useRef, useState} from "react";
import classNames from "classnames";
import {Input} from "antd";

type EdgeInputProps = {
    value: string;
    onChange: (value: string) => void;
    align?: 'center' | 'left' | 'right';
    verticalAlign?: 'top' | 'bottom' | 'center';
    fontSize?: string, // 字体大小
    bold?: boolean, // 是否加粗
    italic?: boolean, // 是否斜体
    underline?: boolean, // 是否下划线
    color?: string, // 颜色
    lineHeight?: string | number, // 行高
    fill?: string, // 背景颜色
}

const EdgeInput = (props: EdgeInputProps) => {
    const {
        value,
        onChange,
        align = 'center',
        verticalAlign = 'center',
        fontSize = '14px',
        bold = false,
        italic = false,
        underline = false,
        color = 'black',
        lineHeight = 'normal',
        fill = 'transparent',
    } = props;
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [prevFontSize, setPrevFontSize] = useState(fontSize);
    const [prevLineHeight, setPrevLineHeight] = useState(lineHeight);
    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus({ preventScroll: true });
        }, 1);
    }, []);

    // 监听输入内容的变化，根据输入内容调整输入框高度
    useEffect(() => {
        const handleInput = () => {
            const textarea = inputRef.current;
            if (!textarea) return;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        };

        const textarea = inputRef.current;
        if (!textarea) return;
        textarea.addEventListener('input', handleInput);

        return () => {
            textarea.removeEventListener('input', handleInput);
        };
    }, []);


    // 监听字号调整，根据字号调整，调整输入框的高度
    useEffect(() => {
        if (prevFontSize !== fontSize) {
            const textarea = inputRef.current;
            if (textarea) {
                // 重置高度，让内容重新填充
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
            setPrevFontSize(fontSize);
        }
    }, [fontSize, prevFontSize]);

    // 监听行高调整，根据行高调整，调整输入框的高度
    useEffect(() => {
        if (prevLineHeight !== lineHeight) {
            const textarea = inputRef.current;
            if (textarea) {
                // 重置高度，让内容重新填充
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
            setPrevLineHeight(lineHeight);
        }
    }, [lineHeight, prevLineHeight]);

    return (
        <div
            className={classNames({
                [styles.inputContainer]: true,
                [styles.verticalAlignTop]: verticalAlign === 'top',
                [styles.verticalAlignCenter]: verticalAlign === 'center',
                [styles.verticalAlignBottom]: verticalAlign === 'bottom',
            })}
        >
            <textarea
                className={classNames({
                    [styles.input]: true,
                })}
                style={{
                    textAlign: align,
                    fontSize,
                    lineHeight,
                    fontWeight: bold ? 'bold' : 'normal',
                    fontStyle: italic ? 'italic' : 'normal',
                    textDecoration: underline ? 'underline' : 'none',
                    color,
                    background: fill,
                }}
                rows={1}
                value={value}
                onChange={(evt) => onChange(evt.target.value)}
                ref={inputRef}
                placeholder={'编辑'}
            />
        </div>
    );
};

export default EdgeInput;