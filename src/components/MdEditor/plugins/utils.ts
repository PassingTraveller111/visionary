import Editor from "react-markdown-editor-lite";
// import {unified} from "unified";
// import remarkParse from "remark-parse";
// import remarkMath from "remark-math";
// import remarkStringify from "remark-stringify";

/**
 * 找到从开始索引到结束索引的所有行的开始位置和结束位置
 * @param {string} text - 要处理的文本
 * @param {number} startIndex - 开始索引
 * @param {number} endIndex - 结束索引
 */
const findLineBoundsInRange = (text: string, startIndex: number, endIndex: number) => {
    const lineBounds: {
        start: number;
        end: number;
    }[] = [];
    let currentIndex = startIndex;

    // 找到开始索引所在行的起始位置
    while (currentIndex > 0 && text[currentIndex - 1]!== '\n') {
        currentIndex--;
    }

    let lineStart = currentIndex;

    while (currentIndex <= endIndex) {
        let lineEnd = currentIndex;
        // 找到当前行的结束位置
        while (lineEnd < text.length && text[lineEnd]!== '\n') {
            lineEnd++;
        }

        // 将当前行的起始和结束位置添加到结果数组中
        lineBounds.push({ start: lineStart, end: lineEnd });

        // 更新下一行的起始位置
        currentIndex = lineEnd + 1;
        lineStart = currentIndex;
    }

    return lineBounds;
}

/**
 * 在当前 所有选中行 每行第一个位置插入文本
 * @param editor 编辑器实例
 * @param insertText 要插入的文本
 * @param detectedTexts 行首需要检测的符号，如果存在需要进行替换
 */
export const insertToSelectLinePrevious = (editor: Editor, insertText: string | ((lineIndex: number) => string), detectedTexts: string[] = []) => {
    const selection = editor.getSelection();
    const text = editor.getMdValue()
    // 开始插入的位置是换行符的位置+1
    // bounds数组存有每行的第一个位置的索引
    const bounds = findLineBoundsInRange(text, selection.start, selection.end);
    let newText = text;
    // 记录被修改区域的开始和结束位置
    let firstModifiedLineStart = Infinity;
    let lastModifiedLineEnd = bounds[bounds.length - 1].end;
    let insertOffset = 0;
    bounds.reverse().forEach((bound, index) => {
        // 从后往前
        const { start } = bound;
        // 行号
        const lineIndex = bounds.length - index;
        // 从整体的文本中，截取当前行的内容
        const lineText = newText.slice(start);
        // 插入的内容 可能是固定的文本，也可能是根据行号发生变化的文本
        const insertContent = typeof insertText === 'string' ? insertText : insertText(lineIndex);
        // 检测到的目标的长度
        let detectedTextLen = 0;
        if (
            detectedTexts.some(detectedText => {
                if(lineText.startsWith(detectedText)) {
                    detectedTextLen = detectedText.length;
                    return true;
                }
                return false;
            })
        ) {
            // 如果包含关键字
            // 删掉关键字后进行拼接
            newText = newText.slice(0, start) + insertContent + lineText.slice(detectedTextLen);
            // 删掉关键字，偏移量变小
            insertOffset -= detectedTextLen;

        } else {
            // 如果不包含关键字
            // 给每行的第一个位置插入上符号
            newText = newText.slice(0, start) + insertContent + newText.slice(start);
        }
        // 插入目标符号，偏移量变大
        insertOffset += insertContent.length;
        // 更新第一行开始位置和最后一行结束位置
        firstModifiedLineStart = Math.min(firstModifiedLineStart, start);
    });
    lastModifiedLineEnd += insertOffset;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    editor.setText(newText, ()=>{}, {
        start: firstModifiedLineStart,
        end: lastModifiedLineEnd,
    });
}

/**
 * 断句/选中区域 前后插入文本
 * @param editor 编辑器实例
 * @param insertTextPre 前面插入的文本
 * @param insertTextLast 后面插入的文本
 */
export const insertToPreAndLast = (editor: Editor, insertTextPre: string, insertTextLast: string) => {
    const selection = editor.getSelection();
    const text = editor.getMdValue()
    // 判断光标的状态 选中/未选中
    if(selection.start === selection.end) {
        // 未选中
        const {
            newText,
            newSelection,
        } = sentenceSegmentation(text, selection.start, insertTextPre, insertTextLast);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        editor.setText(newText, () => {}, newSelection);
    } else {
        // 选中
        const {
            start,
            end,
        } = selection;
        const before = text.slice(0, start);
        const toInsert = text.slice(start, end);
        const after = text.slice(end);
        // toInsert检测前后是否有冲突符号
        if(before.slice(-insertTextPre.length) === insertTextPre && after.slice(0, insertTextLast.length) === insertTextLast) {
            const newBefore = before.slice(0, before.length - insertTextPre.length);
            const newAfter = after.slice(insertTextLast.length);
            const newSelection = {
                start: newBefore.length,
                end: newBefore.length + toInsert.length,
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            editor.setText(`${newBefore}${toInsert}${newAfter}`, ()=>{}, newSelection);
            return;
        }
        const newSelection = {
            start: before.length + insertTextPre.length,
            end: before.length + insertTextPre.length + toInsert.length,
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        editor.setText(`${before}${insertTextPre}${toInsert}${insertTextLast}${after}`, ()=>{}, newSelection);
    }
}

/*
* 断句插入
* */
function sentenceSegmentation(markdown: string, cursorPosition: number, insertTextPre: string, insertTextLast: string) {
    // 定义断句的标点符号
    const punctuation = [
        ' ', '\n',
        // 英文符号
        '.', ',', ';', '?', '!', ':', '—',
        // 中文符号
        '。', '，', '；', '？', '！', '：', '-',
    ];
    let start = cursorPosition;
    let end = cursorPosition;

    // 向前查找断句位置
    while (start > 0 && !punctuation.includes(markdown[start - 1])) {
        start--;
    }

    // 向后查找断句位置
    while (end < markdown.length && !punctuation.includes(markdown[end])) {
        end++;
    }

    // 如果光标前后都是空格，尝试扩展到单词边界
    if (start > 0 && markdown[start - 1] === ' ' && end < markdown.length && markdown[end] === ' ') {
        let newStart = start - 1;
        while (newStart > 0 && markdown[newStart - 1]!== ' ') {
            newStart--;
        }
        let newEnd = end + 1;
        while (newEnd < markdown.length && markdown[newEnd]!== ' ') {
            newEnd++;
        }
        start = newStart;
        end = newEnd;
    }

    // 添加标识
    const before = markdown.slice(0, start);
    const toInsert = markdown.slice(start, end);
    const after = markdown.slice(end);
    // toInsert检测前后是否有冲突符号
    const res = findSurroundingStrings(toInsert, cursorPosition - before.length, insertTextPre, insertTextLast);
    if(res){
        const { start, end } = res;
        // 前面部分 ‘删除的符号部分’ 中间部分 ‘删除的符号部分’ 后面部分 newSelection的索引是中间部分的两端
        const newToInsert = toInsert.slice(0, start) + toInsert.slice(start + insertTextPre.length, end - insertTextLast.length + 1) + toInsert.slice(end + 1);
        return {
            newText: `${before}${newToInsert}${after}`,
            newSelection: {
                // 中间部分开始索引 = before + 前面部分的长度
                start: before.length + start,
                // 中间部分结束的索引 = before + 前面部分的长度 + 中间部分的长度
                end: before.length + start + toInsert.slice(start + insertTextPre.length, end - insertTextLast.length + 1).length,
            }
        }
    }
    const newSelection = {
        start: before.length + insertTextPre.length,
        end: before.length + insertTextPre.length + toInsert.length,
    }
    return {
        newText: `${before}${insertTextPre}${toInsert}${insertTextLast}${after}`,
        newSelection,
    }
}

/*
* 给一个字符串和一个索引，从索引位置向前查找是否有frontStr，向后是否有backStr
* */
function findSurroundingStrings(str: string, index: number, frontStr: string, backStr: string) {
    // 向前查找前部字符串
    let startIndex = -1;
    for (let i = index; i >= frontStr.length - 1; i--) {
        if (str.slice(i - frontStr.length + 1, i + 1) === frontStr) {
            startIndex = i - frontStr.length + 1;
            break;
        }
    }

    if (startIndex === -1) {
        return null;
    }

    // 向后查找后部字符串
    let endIndex = -1;
    for (let i = index; i <= str.length - backStr.length; i++) {
        if (str.slice(i, i + backStr.length) === backStr) {
            endIndex = i + backStr.length - 1;
            break;
        }
    }

    if (endIndex === -1) {
        return null;
    }

    return { start: startIndex, end: endIndex };
}

/*
* 在光标的开始位置插入内容
* */
export const insertInPoint = (editor: Editor, insertText: string) => {
    const selection = editor.getSelection();
    const text = editor.getMdValue();
    const newText = text.slice(0, selection.start) + insertText + text.slice(selection.start);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    editor.setText(newText, () => {}, {
        start: selection.start,
        end: selection.start + insertText.length,
    });
}

export const getSystemType = () => {
    let os;
    if (typeof window!== 'undefined') {
        const platform = window.navigator.platform;
        if (platform.indexOf('Win')!== -1) {
            os = 'win';
        } else if (platform.indexOf('Mac')!== -1) {
            os = 'mac';
        } else {
            os = 'Other';
        }
    } else {
        const osPlatform = process.platform;
        if (osPlatform === 'win32') {
            os = 'win';
        } else if (osPlatform === 'darwin') {
            os = 'mac';
        } else {
            os = 'Other';
        }
    }
    return os;
}


// /*
// * 块级内容插入（适用于块级代码和块级公式）
// * */
// export const insertBlockCode = (editor: Editor) => {
//     const selection = editor.getSelection();
//     let markdown = editor.getMdValue();
//     const processor = unified()
//         .use(remarkParse) // 转换为语法树的插件
//         .use(remarkMath) // 转换为语法树的时候用来分析数学公式的插件
//         .use(remarkStringify); // 将语法树转换为markdown的插件
//     const ast = processor.parse(markdown);
//     console.log('ast', ast);
//     let newSelection = {
//         start: 0,
//         end: 0,
//     }
//     const res = findNodeByIndex(ast, selection.start);
//     if(res.node && res.node.type === 'code'){
//         newSelection = {
//             start: res.node.position.start.offset,
//             end: res.node.position.start.offset,
//         }
//         // 创建一个新的段落节点
//         const paragraph = {
//             type: 'paragraph',
//             children: [
//                 {
//                     type: 'text',
//                     value: res.node.value
//                 }
//             ]
//         };
//         // 用新的段落节点替换原有的 code 节点
//         if(res.parentNode)
//             res.parentNode.children.splice(res.path[res.path.length - 1], 1, paragraph);
//     }
//     markdown = processor.stringify(ast);
//     editor.setText(markdown, () => {}, newSelection);
// }
//
// type nodeType = {
//     position: {
//         start: {
//             offset: number;
//         },
//         end: {
//             offset: number;
//         },
//     },
//     type: string,
//     children: nodeType[],
//     value: string,
// } | undefined;
//
// // 自定义函数：根据索引查找语法树中的节点
// function findNodeByIndex(tree: nodeType, index: number) {
//     let foundNode: nodeType | null = null;
//     const foundPath: number[] = [];
//     let foundParentNode: nodeType | null = null;
//     // 先序递归遍历
//     function traverse(node: nodeType, parentNode: nodeType | null, path: number) {
//         // 结束条件
//         if (node && node.position) {
//             // 当前遍历节点的开始到结束的索引
//             const start = node.position.start.offset;
//             const end = node.position.end.offset;
//             if (index < start || index > end) return;
//         }
//
//         if (node && node.children) {
//             for (let i = 0; i < node.children.length; i++) {
//                 traverse(node.children[i], node, i);
//                 // 如果找到节点，就直接break结束递归
//                 if (foundNode) {
//                     break;
//                 }
//             }
//         } else {
//             // 符合条件且没有子节点了
//             foundNode = node;
//             foundParentNode = parentNode;
//         }
//         // 记录路径 路径是children上的索引
//         foundPath.unshift(path);
//     }
//
//     traverse(tree, null, 0);
//     return { node: foundNode, parentNode: foundParentNode, path: foundPath };
// }