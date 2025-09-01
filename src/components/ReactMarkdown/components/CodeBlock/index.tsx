import {ComponentType} from "@/components/ReactMarkdown/components/type";
import {useId, useState} from "react";
import styles from './index.module.scss';
import {IconFont} from "@/components/IconFont";
import classNames from "classnames";

const CodeComponents: ComponentType  = ({children, className}) => {
    const uniqueId = useId(); // 使用 useId 生成唯一 ID
    const [copied, setCopied] = useState(false);
    const [isUnFold, setIsUnFold] = useState(true);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const match = /language-(\w+)/.exec(children && children.props.className || "");
    const languageLabel = match ? match[1] : '';
    const handleCopy = async () => {
        try {
            const text = document.getElementById(uniqueId)?.innerText || "";
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
        } catch (error) {
            console.error("复制失败:", error);
        }
    };
    return(
        <div>
            <div className={styles.codeBlockHeader}>
                <span
                    className={styles.headerLeft}
                    onClick={() => {
                        setIsUnFold(pre => !pre);
                    }}
                >
                    <span>{languageLabel}</span>
                    <IconFont
                        type={isUnFold ? 'icon-topArrow' : 'icon-bottomArrow' }
                    />
                </span>
                <button className={styles.copyButton} onClick={handleCopy}>
                    {copied ? "代码已复制" : "复制代码"}
                </button>
            </div>
            {
                isUnFold && <pre
                    className={classNames(className, styles.codeContainer)}
                    id={uniqueId}
                >
                    {children}
                </pre>
            }
        </div>
    )
}

export default CodeComponents;