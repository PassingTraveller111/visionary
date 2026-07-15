import {MarkdownProps, MarkdownRenderer, serverMarkdownComponents} from '@/components/ReactMarkdown/core';

const MarkdownServer = (props: MarkdownProps) => {
    return <MarkdownRenderer
        {...props}
        components={{
            ...serverMarkdownComponents,
            ...props.components,
        }}
    />;
}

export default MarkdownServer;
