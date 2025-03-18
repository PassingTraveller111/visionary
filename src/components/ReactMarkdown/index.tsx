import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';
import rehypeHighlight from "rehype-highlight"; // 添加代码高亮样式
import remarkMath from "remark-math"; // 识别数学公式
import rehypeKatex from "rehype-katex"; // 添加数学公式样式
import remarkGfm from "remark-gfm"; // 识别表格、任务列表等
import CodeBlockComponents from "./components/CodeBlock";
import ImageComponents from "@/components/ReactMarkdown/components/image";
import rehypeRaw from "rehype-raw"; // 允许渲染html标签

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const MyReactMarkdown = (props) => {
    return <span className={styles.markdown}>
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]} // 输入输出为markdown，负责markdown的解析和转换
                rehypePlugins={[rehypeHighlight, rehypeKatex, rehypeRaw]} // 输入和输出为html，负责html的解析和转换
                {...props}
                components={{
                    pre: CodeBlockComponents, // 通过pre标签获得代码块
                    img: ImageComponents,
                    ...props.components,
                }}
            />
    </span>
};

export default MyReactMarkdown;