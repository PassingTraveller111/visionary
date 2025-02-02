"use client"
import dynamic from 'next/dynamic';
import 'react-markdown-editor-lite/lib/index.css';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import MarkdownIt from "markdown-it";

// 初始化Markdown解析器
const mdParser = new MarkdownIt(/* Markdown-it options */);

const MdEditor = dynamic(() => import('react-markdown-editor-lite'), {
    ssr: false,
});


const EditorPage = () => {
    return <>
        <MdEditor style={{ height: '500px' }} renderHTML={text => mdParser.render(text)} />;
    </>
}
export default EditorPage;