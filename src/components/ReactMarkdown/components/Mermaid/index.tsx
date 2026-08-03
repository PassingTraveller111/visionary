"use client"

import {isValidElement, ReactNode, useEffect, useId, useState} from "react";
import {ComponentType} from "@/components/ReactMarkdown/components/type";
import styles from './index.module.scss';

let mermaidPromise: Promise<typeof import('mermaid').default> | undefined;

const loadMermaid = () => {
    mermaidPromise ??= import('mermaid').then(({default: mermaid}) => {
        mermaid.initialize({
            startOnLoad: false,
            securityLevel: 'strict',
        });
        return mermaid;
    });
    return mermaidPromise;
}

const getSource = (children: ReactNode) => {
    if (isValidElement<{children?: ReactNode}>(children)) {
        return String(children.props.children ?? '').replace(/\n$/, '');
    }
    return String(children ?? '').replace(/\n$/, '');
}

const MermaidComponents: ComponentType = ({children}) => {
    const renderId = `mermaid-${useId().replace(/:/g, '')}`;
    const source = getSource(children);
    const [svg, setSvg] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        setSvg('');
        setError('');
        loadMermaid()
            .then(mermaid => mermaid.render(renderId, source))
            .then(result => {
                if (!cancelled) setSvg(result.svg);
            })
            .catch(renderError => {
                console.error('Mermaid rendering failed:', renderError);
                if (!cancelled) setError('Mermaid 图表语法有误，无法渲染。');
            });

        return () => {
            cancelled = true;
        };
    }, [renderId, source]);

    if (error) {
        return <div className={styles.error} role="alert">{error}</div>;
    }

    return <div
        className={styles.mermaid}
        aria-busy={!svg}
        dangerouslySetInnerHTML={{__html: svg}}
    />;
}

export default MermaidComponents;
