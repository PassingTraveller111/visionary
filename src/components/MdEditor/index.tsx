"use client"
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
import rootPluginsList from "@/components/MdEditor/plugins/root";
import ReactMarkdown from "@/components/ReactMarkdown";
import styles from "./index.module.scss";
import {Plugins} from "react-markdown-editor-lite";
import classNames from "classnames";
import {useEffect} from "react";

// 动态加载编辑器
const loadMarkdownEditor = async () => {
    try {
        const { default: MarkdownEditor } = await import('react-markdown-editor-lite');
        delete Plugins.Logger;
        Object.keys(Plugins).forEach((key) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            MarkdownEditor.unuse(Plugins[key]);
        });
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
    value: string;
    onChange: (value: string) => void;
    className?: string;
}



const ReactEditor = (props: ReactEditorProps) => {
    const { value = '', onChange, className } = props;
    useEffect(() => {
        const html = document.documentElement;
        html.style.overflow = 'hidden';
    }, []);
    return <>
        <MdEditor
            className={classNames(styles.mdEditorContainer, className)}
            value={value}
            onChange={(e) => onChange(e.text)}
            shortcuts
            renderHTML={text => {
                return <ReactMarkdown>{text}</ReactMarkdown>;
            }}
        />
    </>
}
export default ReactEditor;