"use client"
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import MarkdownIt from "markdown-it";
import {useEffect, useState} from "react";
import SavePlugin from "@/components/MdEditor/plugins/SavePlugin";


// 初始化Markdown解析器
const mdParser = new MarkdownIt(/* Markdown-it options */);

// 动态加载编辑器
const loadMarkdownEditor = async () => {
    try {
        const { default: MarkdownEditor } = await import('react-markdown-editor-lite');
        // eslint-disable-next-line react-hooks/rules-of-hooks
        MarkdownEditor.use(SavePlugin);
        return MarkdownEditor;
    } catch (error) {
        console.error('Failed to load Markdown editor:', error);
        throw error;
    }
};

const MdEditor = dynamic(loadMarkdownEditor, {
    ssr: false
});

type ReactEditorProps = {
    initialValue?: string;
}

const ReactEditor = (props: ReactEditorProps) => {
    const { initialValue = ''} = props;
    const [value, setValue] = useState(initialValue);
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue])
    return <>
        <MdEditor
            // ref={editorRef}
            value={value}
            onChange={(e) => setValue(e.text)}
            shortcuts
            style={{height: '500px'}}
            renderHTML={text => mdParser.render(text)}
        />
    </>
}
export default ReactEditor;