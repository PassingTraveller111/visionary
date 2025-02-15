import ReactMarkdown from 'react-markdown';
import styles from './index.module.scss';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const MyReactMarkdown = (props) => {
    return <span className={styles.markdown}>
        <ReactMarkdown {...props}/>
    </span>
}

export default MyReactMarkdown;