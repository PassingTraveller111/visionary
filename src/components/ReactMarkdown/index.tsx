"use client"

import ImageComponents from "@/components/ReactMarkdown/components/image";
import PreParseComponents from "@/components/ReactMarkdown/components/PreParse"; // 允许渲染html标签
import {MarkdownProps, MarkdownRenderer, serverMarkdownComponents} from "@/components/ReactMarkdown/core";
import type {Components} from "react-markdown";

const MyReactMarkdown = (props: MarkdownProps) => {
    return <MarkdownRenderer
        {...props}
        components={{
            ...serverMarkdownComponents,
            pre: PreParseComponents as Components['pre'], // 通过pre标签获得代码块
            img: ImageComponents as Components['img'],
            ...props.components,
        }}
    />
};

export default MyReactMarkdown;
