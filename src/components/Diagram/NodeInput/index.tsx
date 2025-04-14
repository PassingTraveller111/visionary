import styles from './index.module.scss';
import { useEffect, useRef } from "react";
import classNames from "classnames";

type NodeInputProps = {
    value: string;
    onChange: (value: string) => void;
}

const NodeInput = (props: NodeInputProps) => {
    const { value, onChange } = props;
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const parentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            inputRef.current?.focus({ preventScroll: true });
        }, 1);
    }, []);

    useEffect(() => {
        const handleInput = () => {
            const textarea = inputRef.current;
            if (!textarea) return;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        };

        const textarea = inputRef.current;
        if (!textarea) return;
        textarea.addEventListener('input', handleInput);

        return () => {
            textarea.removeEventListener('input', handleInput);
        };
    }, []);

    useEffect(() => {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const textarea = inputRef.current;
                if (!textarea) return;
                // 重新调整高度以适应内容
                textarea.style.height = 'auto';
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        });

        const parentElement = parentRef.current;
        if (parentElement) {
            resizeObserver.observe(parentElement);
        }

        return () => {
            if (parentElement) {
                resizeObserver.unobserve(parentElement);
            }
        };
    }, []);

    return (
        <div
            ref={parentRef}
            className={classNames({
                [styles.inputContainer]: true,
            })}
        >
            <textarea
                className={classNames({
                    [styles.input]: true,
                })}
                rows={1}
                value={value}
                onChange={(evt) => onChange(evt.target.value)}
                ref={inputRef}
            />
        </div>
    );
};

export default NodeInput;