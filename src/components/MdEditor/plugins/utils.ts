import Editor from "react-markdown-editor-lite";


/**
 * 找到索引所在行的第一个位置和最后一个位置
 * @param {string} text - 要处理的文本
 * @param {number} index - 开始查找的索引
 * @returns {{start: number, end: number}} - 一个包含行首和行尾位置的对象
 *          @property {number} start - 该行的第一个位置的索引
 *          @property {number} end - 该行的最后一个位置的下一个索引
 */
const findLineBounds = (text: string, index: number) => {
    // 向前查找行首
    let start = index;
    while (start > 0 && text[start - 1]!== '\n') {
        start--;
    }
    // 向后查找行尾
    let end = index;
    while (end < text.length && text[end]!== '\n') {
        end++;
    }
    return {
        start: start,
        end: end
    };
}

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
 * 在当前 所有选中行 第一个位置插入文本
 * @param editor 编辑器实例
 * @param insertText 要插入的文本
 */
export const insertToSelectLinePrevious = (editor: Editor, insertText: string) => {
    const selection = editor.getSelection();
    const text = editor.getMdValue()
    // 开始插入的位置是换行符的位置+1
    // bounds数组存有每行的第一个位置的索引
    const bounds = findLineBoundsInRange(text, selection.start, selection.end);
    let newText = text;
    const detectedTexts = ['# ', '## ', '### ', '#### ', '##### ', '###### '];
    bounds.reverse().forEach((bound) => {
        // 从后往前
        const { start } = bound;
        const lineText = newText.slice(start);
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
            newText = newText.slice(0, start) + insertText + lineText.slice(detectedTextLen);
        } else {
            // 如果不包含关键字
            // 给每行的第一个位置插入上符号
            newText = newText.slice(0, start) + insertText + newText.slice(start);
        }
    });
    editor.setText(newText);
}
/**
 *
 * @param editor 编辑器实例
 */
const replaceText = (editor: Editor, ) => {

}


/**
 *
 * 考虑的情况
 * 1. 什么也没选
 * 2. 选中一部分文本
 * 3. 选中多行文本
 */