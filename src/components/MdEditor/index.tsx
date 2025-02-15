"use client"
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
import {useEffect, useState} from "react";
import rootPluginsList from "@/components/MdEditor/plugins/root";
import ReactMarkdown from "react-markdown";


// 动态加载编辑器
const loadMarkdownEditor = async () => {
    try {
        const { default: MarkdownEditor } = await import('react-markdown-editor-lite');
        rootPluginsList.map(plugin => {
            MarkdownEditor.use(plugin);
        });
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
            value={value}
            onChange={(e) => setValue(e.text)}
            shortcuts
            style={{height: 'calc(100vh - 32px)'}}
            renderHTML={text => {
                return <ReactMarkdown>{text}</ReactMarkdown>;
            }}
        />
    </>
}
export default ReactEditor;