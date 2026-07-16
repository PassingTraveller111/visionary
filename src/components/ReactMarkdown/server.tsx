import {MarkdownProps, MarkdownRenderer, serverMarkdownComponents} from '@/components/ReactMarkdown/core';
import PreParseComponents from '@/components/ReactMarkdown/components/PreParse';
import type {Components} from 'react-markdown';

const MarkdownServer = (props: MarkdownProps) => {
    return <MarkdownRenderer
        {...props}
        components={{
            ...serverMarkdownComponents,
            pre: PreParseComponents as Components['pre'],
            ...props.components,
        }}
    />;
}

export default MarkdownServer;
