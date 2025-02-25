
import Editor from "react-markdown-editor-lite";


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
export const insertToSelectLinePrevious = (editor: Editor, insertText: string, detectedTexts: string[] = []) => {
    const selection = editor.getSelection();
    const text = editor.getMdValue()
    // 开始插入的位置是换行符的位置+1
    // bounds数组存有每行的第一个位置的索引
    const bounds = findLineBoundsInRange(text, selection.start, selection.end);
    let newText = text;
    // 记录被修改区域的开始和结束位置
    let firstModifiedLineStart = Infinity;
    let lastModifiedLineEnd = -Infinity;
    bounds.reverse().forEach((bound) => {
        // 从后往前
        const { start } = bound;
        const lineText = newText.slice(start);
        // 检测到的目标的长度
        let detectedTextLen = 0;
        let insertOffset = insertText.length;
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
            newText = newText.slice(0, start) + insertText + lineText.slice(detectedTextLen);
            insertOffset -= detectedTextLen;
        } else {
            // 如果不包含关键字
            // 给每行的第一个位置插入上符号
            newText = newText.slice(0, start) + insertText + newText.slice(start);
        }
        // 更新第一行开始位置和最后一行结束位置
        firstModifiedLineStart = Math.min(firstModifiedLineStart, start);
        const lineEnd = start + lineText.length + insertOffset;
        lastModifiedLineEnd = Math.max(lastModifiedLineEnd, lineEnd);
    });
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
    const newSelection = {
        start: before.length + insertTextPre.length,
        end: before.length + insertTextPre.length + toInsert.length,
    }
    return {
        newText: `${before}${insertTextPre}${toInsert}${insertTextLast}${after}`,
        newSelection,
    }
}