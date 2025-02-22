import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';
import rehypeHighlight from "rehype-highlight";
import 'highlight.js/styles/default.css'; // 引入高亮样式

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const MyReactMarkdown = (props) => {
    return <span className={styles.markdown}>
        <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            {...props}
        />
    </span>
}

export default MyReactMarkdown;