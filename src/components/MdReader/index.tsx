"use client"
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';
import {useEffect, useState} from "react";


// 动态加载编辑器
const loadMarkdownEditor = async () => {
    try {
        const { default: MarkdownEditor } = await import('react-markdown-editor-lite');
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

const ReactReader = (props: ReactEditorProps) => {
    const { initialValue = ''} = props;
    const [value, setValue] = useState(initialValue);
    useEffect(() => {
        setValue(initialValue);
    }, [initialValue])

    return <>
        <MdEditor
            value={value}
            onChange={(e) => setValue(e.text)}
            view={{
                menu: false,
                md: false,
                html: true,
            }}
            style={{height: 'calc(100vh - 50px - 112px)'}}
            renderHTML={text => {
                return <ReactMarkdown>{text}</ReactMarkdown>;
            }}
        />
    </>
}
export default ReactReader;