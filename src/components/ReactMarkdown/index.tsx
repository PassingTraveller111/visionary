import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import CodeBlockComponents from "./components/CodeBlock";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const MyReactMarkdown = (props) => {
    return <span className={styles.markdown}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                {...props}
                components={{
                    pre: CodeBlockComponents, // 通过pre标签获得代码块
                    ...props.components,
                }}
            />
    </span>
};

export default MyReactMarkdown;