import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';
import rehypeHighlight from "rehype-highlight";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const MyReactMarkdown = (props) => {
    return <span className={styles.markdown}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeHighlight, rehypeKatex]}
                {...props}
            />
    </span>
};

export default MyReactMarkdown;