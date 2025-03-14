'use client'
import React, {useEffect, useRef, useState} from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import styles from './index.module.scss';
import {Input, InputRef, Popover, Tooltip} from "antd";
import classNames from "classnames";
import {IconFont} from "@/components/IconFont";
import {useEditorOnKeyDown} from "@/components/MdEditor/plugins/hooks";
import {debounce} from "next/dist/server/utils";


const FindPlugin = (props: PluginProps) => {
    const { editor } = props;
    const [showFind, setShowFind] = useState(false);
    // 匹配项，针对的是转义后的内容
    const [matches, setMatches] = useState<number[]>([]);
    const [findInputValue, setFindInputValue] = useState('');
    const findInputRef = useRef<InputRef>(null);
    const [replaceInputValue, setReplaceInputValue] = useState('');
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isCaseSensitive, setIsCaseSensitive] = useState(false); // 区分大小写，后续加
    const openFindBox = () => {
        // 打开查找框
        setShowFind(true);
        // 将查找内容改成选中的内容 假如没有选中的内容，那就是空
        const findKey =  editor.getSelection().text;
        setFindInputValue(findKey);
        // 清空替换框
        setReplaceInputValue('');
        // 查找匹配项
        const initMatches =  findAllMatches(editor.getMdValue(), findKey);
        setMatches(initMatches);
        // 初始化查找索引
        const initCurrentIndex = initMatches.length > 0 ? 0 : -1;
        setCurrentIndex(initCurrentIndex);
        // 初始化元素
        initFindElems();
        // 添加高光
        setHighlight(findKey, initMatches, initCurrentIndex);
    }
    const closeFindBox = () => {
        setShowFind(false);
        // 移除查找层
        const findLayerEle =  getFindLayerElm();
        if(!findLayerEle) return;
        findLayerEle.remove();
    }
    const onPre = () => {
        const newCurrentIndex = currentIndex <= 0 ? matches.length - 1 : currentIndex - 1;
        setCurrentIndex(newCurrentIndex);
        setHighlight(findInputValue, matches, newCurrentIndex);
    }
    const onNext = () => {
        const newCurrentIndex = currentIndex + 1 >= matches.length ? 0 : currentIndex + 1;
        setCurrentIndex(newCurrentIndex);
        setHighlight(findInputValue, matches, newCurrentIndex);
    }
    const onReplace = () => {
        const newText = getReplacedText(editor.getMdValue(), replaceInputValue, findInputValue, currentIndex, matches);
        // 这个是异步操作，所以后面的添加高光不能从元素上获取新文本
        editor.setText(newText);
        // 查找匹配项
        const initMatches =  findAllMatches(newText, findInputValue);
        setMatches(initMatches);
        // 更新查找索引
        // 没有匹配项了 ? -1 : (当前索引为0 ？ 0 ： 当前索引-1  )
        const newCurrentIndex = initMatches.length <= 0 ? -1 : ( currentIndex <= 0 ? 0 : currentIndex - 1 );
        setCurrentIndex(newCurrentIndex);
        // 添加高光
        setHighlight(findInputValue, initMatches, newCurrentIndex, newText);
    }
    const onReplaceAll = () => {
        const newText = getReplacedAllText(editor.getMdValue(), replaceInputValue, findInputValue, matches);
        editor.setText(newText);
        // 查找匹配项
        const initMatches =  findAllMatches(newText, findInputValue);
        setMatches(initMatches);
        // 更新查找索引
        setCurrentIndex(-1);
        // 添加高光
        setHighlight(findInputValue, initMatches, -1, newText);
    }
    useEditorOnKeyDown(editor, 'find', (e) => {
        e.preventDefault();
        if(showFind) closeFindBox();
        else openFindBox();
    });
    // 用于打开查找框时聚焦到findInput上
    useEffect(() => {
        if(showFind && findInputRef.current){
            findInputRef.current.focus();
        }
    }, [showFind]);
    return <Tooltip
        title='查找'
    >
        <Popover
            open={showFind}
            trigger='click'
            onOpenChange={(open) => {
                if(open) {
                    openFindBox();
                }
                else closeFindBox();
            }}
            placement='bottom'
            content={<div className={styles.findContainer}>
                <div className={styles.findLine}>
                    <Input
                        ref={findInputRef}
                        placeholder='查找'
                        value={findInputValue}
                        onChange={(e) => {
                            setFindInputValue(e.target.value);
                            debounceSetHighLight(editor.getMdValue(), e.target.value, currentIndex, setMatches);
                        }}
                    />
                    <div>
                        <IconFont
                            type='icon-topArrow'
                            onClick={onPre}
                        />
                        <IconFont
                            type='icon-bottomArrow'
                            onClick={onNext}
                        />
                    </div>
                    <div>
                        {matches.length === 0 ? '无结果' : ((currentIndex + 1) + '/' + matches.length)}
                    </div>
                </div>
                <div className={styles.replaceLine}>
                    <Input
                        value={replaceInputValue}
                        placeholder='替换'
                        onChange={(e) => {
                            setReplaceInputValue(e.target.value);
                        }}
                    />
                    <div>
                        <button onClick={onReplaceAll}>全部</button>
                    </div>
                    <div>
                        <button onClick={onReplace} >替换</button>
                    </div>
                </div>
            </div>}
        >
            <span
                className={classNames({
                    'button': true,
                    [styles.FindPluginContainer]: true,
                })}
            >
                <IconFont type='icon-find'/>
            </span>
        </Popover>
    </Tooltip>
}
FindPlugin.align = 'left';
FindPlugin.pluginName = 'FindPlugin';


export default FindPlugin;

// 将高亮元素滚动到可视范围
const scrollToHighlightedElement = () => {
    const findLayerEle = getFindLayerElm();
    const editorEle = getEditorElm();
    if (!findLayerEle || !editorEle) return;
    const currentHighlight = findLayerEle.querySelector('.curHighlight');
    if (currentHighlight) {
        // 计算当前高亮元素相对于父元素的位置
        const rect = currentHighlight.getBoundingClientRect();
        const parentRect = findLayerEle.getBoundingClientRect();
        const topOffset = rect.top - parentRect.top;
        // 滚动父元素
        findLayerEle.scrollTo({
            top: findLayerEle.scrollTop + topOffset - findLayerEle.clientHeight / 2,
            behavior: 'instant'
        });
        editorEle.scrollTop = findLayerEle.scrollTop;
    }
}

// 全部替换
const getReplacedAllText = (text: string, replaceKey: string, findKey: string, matches: number[]) => {
    if(matches.length === 0) return text;
    const escapedText = escapeHTML(text);
    const escapedFindKey = escapeHTML(findKey);
    const escapedReplaceKey = escapeHTML(replaceKey);
    let newText = escapedText;
    // 从后往前进行替换，不然索引会乱
    matches.reverse().forEach((index) => {
        newText = newText.slice(0, index) + escapedReplaceKey + newText.slice(index + escapedFindKey.length);
    })
    // 最后对替换后的文本进行 HTML 逆转义，恢复文本的原始状态
    return unescapeHTML(newText);
}

// 替换
const getReplacedText = (text: string, replaceKey: string, findKey: string, currentIndex: number, matches: number[]) => {
    if(currentIndex === -1 || matches.length === 0) return text;
    const index = matches[currentIndex];
    const escapedText = escapeHTML(text);
    const escapedFindKey = escapeHTML(findKey);
    const escapedReplaceKey = escapeHTML(replaceKey);
    // 构建替换后的文本
    const newText = escapedText.slice(0, index) + escapedReplaceKey + escapedText.slice(index + escapedFindKey.length);
    // 最后对替换后的文本进行 HTML 逆转义，恢复文本的原始状态
    return unescapeHTML(newText);
}

// 添加高亮
const setHighlight = (findKey: string, matches: number[], currentIndex: number, text?: string) => {
    const editorElm = getEditorElm();
    const parentElm = getEditorParentElm();
    const findLayerElement = getFindLayerElm();
    if(!editorElm || !parentElm || ! findLayerElement) return null;
    // 添加高亮
    // 先对文本进行转义，不然会被html识别成标签
    const escapedText = escapeHTML(text ?? editorElm.value);
    // 然后再插入高亮
    // findKey也要做转义，不然可能查找内容被转义以后就查不到了
    const escapedFindKey = escapeHTML(findKey);
    // 还需要做正则表达式的转义，否则正则匹配会有问题
    const escapedRegexFindKey = escapeRegExp(escapedFindKey);
    const regex = new RegExp(escapedRegexFindKey, "g");
    findLayerElement.innerHTML = escapedText.replace(regex, (match, index) => {
        if(index === matches[currentIndex]) return `<span class="curHighlight">${match}</span>`;
        return `<span class="highlight">${match}</span>`;
    });
    // 滚动到可视范围
    scrollToHighlightedElement();
}

// 初始化元素
const initFindElems = () => {
    const editorElm = getEditorElm();
    const parentElm = getEditorParentElm();
    if(!editorElm || !parentElm) return null;
    // 初始化
    parentElm.style.position = 'relative';
    const findLayerElement = document.createElement("div");
    findLayerElement.className = styles.findLayer;
    findLayerElement.id = 'findLayer';
    parentElm.insertBefore(findLayerElement, editorElm);
    // 同步textarea的内容到findLayer
    findLayerElement.textContent = editorElm.value;
    editorElm.addEventListener("input", () => {
        findLayerElement.textContent = editorElm.value;
    });
    // 同步滚动位置
    findLayerElement.scrollTop = editorElm.scrollTop;
    findLayerElement.scrollLeft = editorElm.scrollLeft;
    editorElm.addEventListener("scroll", () => {
        findLayerElement.scrollTop = editorElm.scrollTop;
        findLayerElement.scrollLeft = editorElm.scrollLeft;
    });
}

// 对字符串中的正则表达式特殊字符进行转义
function escapeRegExp(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 对文本进行 HTML 逆转义
function unescapeHTML(text: string): string {
    const map: { [key: string]: string } = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return text.replace(/&(?:amp|lt|gt|quot|#039);/g, function (substring: string) {
        return map[substring] || substring;
    });
}

// 对文本进行 HTML 转义
function escapeHTML(text: string): string {
    const map: { [key: string]: string } = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (substring: string) {
        return map[substring] || substring;
    });
}

// 查找所有匹配项的索引
const findAllMatches = (text: string, findKey: string) => {
    if(!findKey){
        return [];
    }
    const matches: number[] = [];
    // 应该对转义后的内容进行查找
    const escapedText = escapeHTML(text);
    // 用转义后findKey进行查找，这里不用正则，所以不用正则转义
    const escapedFindKey = escapeHTML(findKey);
    let index = escapedText.indexOf(escapedFindKey);
    while (index !== -1) {
        matches.push(index);
        index = escapedText.indexOf(escapedFindKey, index + 1);
    }
    return matches;
}
// 防抖进行匹配以及高光添加
const debounceSetHighLight =  debounce((text: string, findKey: string, currentIndex: number, setMatches) => {
    const matches = findAllMatches(text, findKey);
    setHighlight(findKey, matches, currentIndex);
    setMatches(matches);
}, 800);
// 获取编辑器元素
const getEditorElm = () => {
    const editorElms = document.querySelectorAll('textarea.section-container.input');
    if (editorElms.length > 0) return editorElms[0] as HTMLTextAreaElement;
    else return null;
}
// 获取父元素
const getEditorParentElm = () => {
    const editorElm = getEditorElm();
    if (editorElm) {
        const parentElm = editorElm.parentNode as HTMLDivElement | null;
        if (parentElm) return parentElm;
    }
    return null;
}
// 获取查找层元素
const getFindLayerElm = () => {
    const findLayerEle =  document.getElementById('findLayer');
    if(!findLayerEle) return null;
    return findLayerEle;
}