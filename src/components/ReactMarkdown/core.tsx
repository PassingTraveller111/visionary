import React, {ComponentProps} from 'react';
import ReactMarkdown, {UrlTransform} from 'react-markdown';
import type {Components} from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import styles from './index.module.scss';

type HastNode = {
    type?: string;
    tagName?: string;
    value?: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
}

export type MarkdownProps = ComponentProps<typeof ReactMarkdown>;

const allowedTags = new Set([
    'a', 'blockquote', 'br', 'code', 'del', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'hr', 'img', 'input', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'sub', 'sup', 'table',
    'tbody', 'td', 'th', 'thead', 'tr', 'ul',
    // KaTeX MathML output.
    'annotation', 'math', 'mi', 'mn', 'mo', 'mrow', 'mspace', 'msqrt', 'msub', 'msubsup',
    'msup', 'mtext', 'semantics',
]);

const blockedTags = new Set([
    'base', 'button', 'canvas', 'embed', 'form', 'iframe', 'link', 'meta', 'object', 'option',
    'script', 'select', 'source', 'style', 'svg', 'textarea', 'video', 'audio',
]);

const sanitizeClassName = (value: unknown) => {
    const values = Array.isArray(value) ? value : String(value ?? '').split(/\s+/);
    return values.filter(item => typeof item === 'string' && /^[A-Za-z0-9_-]+$/.test(item));
}

const sanitizeDimension = (value: unknown) => {
    if (typeof value === 'number') return value > 0 && value <= 4096 ? value : undefined;
    if (typeof value !== 'string') return undefined;
    if (/^\d{1,4}$/.test(value)) return Number(value) <= 4096 ? value : undefined;
    if (/^(100|[1-9]?\d)%$/.test(value)) return value;
    return undefined;
}

const sanitizeUrl = (url: unknown, key: string) => {
    if (typeof url !== 'string') return undefined;
    const value = url.trim();
    if (!value || value.startsWith('//')) return undefined;

    const normalized = value.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
    if (
        normalized.startsWith('javascript:') ||
        normalized.startsWith('data:') ||
        normalized.startsWith('vbscript:') ||
        normalized.startsWith('file:')
    ) {
        return undefined;
    }

    const protocol = /^[A-Za-z][A-Za-z\d+.-]*:/.exec(value)?.[0].toLowerCase();
    if (!protocol) return value;
    if (key === 'href' && ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol)) return value;
    if (key === 'src' && ['http:', 'https:'].includes(protocol)) return value;
    return undefined;
}

const sanitizeProperties = (tagName: string, properties: Record<string, unknown> = {}) => {
    const safeProperties: Record<string, unknown> = {};
    const className = sanitizeClassName(properties.className);
    if (className.length > 0) safeProperties.className = className;

    if (tagName === 'a') {
        const href = sanitizeUrl(properties.href, 'href');
        if (href) safeProperties.href = href;
        if (typeof properties.title === 'string') safeProperties.title = properties.title;
        safeProperties.rel = ['nofollow', 'noopener', 'noreferrer'];
    }

    if (tagName === 'img') {
        const src = sanitizeUrl(properties.src, 'src');
        if (src) safeProperties.src = src;
        if (typeof properties.alt === 'string') safeProperties.alt = properties.alt;
        if (typeof properties.title === 'string') safeProperties.title = properties.title;
        const width = sanitizeDimension(properties.width);
        const height = sanitizeDimension(properties.height);
        if (width) safeProperties.width = width;
        if (height) safeProperties.height = height;
    }

    if (tagName === 'input') {
        safeProperties.type = 'checkbox';
        safeProperties.disabled = true;
        if (typeof properties.checked === 'boolean') safeProperties.checked = properties.checked;
    }

    if ((tagName === 'td' || tagName === 'th') && typeof properties.align === 'string') {
        if (['left', 'center', 'right'].includes(properties.align)) safeProperties.align = properties.align;
    }

    return safeProperties;
}

const sanitizeNode = (node: HastNode): HastNode | HastNode[] | null => {
    if (node.children) {
        const children = node.children.flatMap(child => {
            const sanitized = sanitizeNode(child);
            if (!sanitized) return [];
            return Array.isArray(sanitized) ? sanitized : [sanitized];
        });
        node.children = children;
    }

    if (node.type !== 'element' || !node.tagName) return node;

    const tagName = node.tagName.toLowerCase();
    if (blockedTags.has(tagName)) return null;
    if (!allowedTags.has(tagName)) return node.children ?? null;

    node.tagName = tagName;
    node.properties = sanitizeProperties(tagName, node.properties);
    return node;
}

const rehypeSanitizeMarkdownHtml = () => (tree: HastNode) => {
    sanitizeNode(tree);
}

const safeUrlTransform: UrlTransform = (url, key) => sanitizeUrl(url, key) ?? '';

const hasImageNode = (node?: HastNode): boolean => {
    if (!node) return false;
    if (node.type === 'element' && node.tagName === 'img') return true;
    return node.children?.some(hasImageNode) ?? false;
}

const Paragraph: Components['p'] = ({node, children, ...props}) => {
    const elementProps = { ...props, ref: undefined };
    if (hasImageNode(node as HastNode)) {
        const className = [props.className, styles.paragraph].filter(Boolean).join(' ');
        return <div {...elementProps} className={className}>{children}</div>;
    }

    return <p {...elementProps}>{children}</p>;
}

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const createHeading = (Tag: HeadingTag) => {
    const Heading: Components[HeadingTag] = ({children, ...props}) => {
        const id = React.Children.toArray(children).join('').replace(/\s/g, '-').toLowerCase();
        return <Tag id={id} {...props}>{children}</Tag>;
    };
    return Heading;
}

export const serverMarkdownComponents: Components = {
    p: Paragraph,
    h1: createHeading('h1'),
    h2: createHeading('h2'),
    h3: createHeading('h3'),
    h4: createHeading('h4'),
    h5: createHeading('h5'),
    h6: createHeading('h6'),
};

export const MarkdownRenderer = ({components, ...props}: MarkdownProps) => {
    return <span className={styles.markdown}>
        <ReactMarkdown
            {...props}
            remarkPlugins={[remarkMath, remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitizeMarkdownHtml, rehypeHighlight, rehypeKatex]}
            urlTransform={safeUrlTransform}
            components={{
                ...serverMarkdownComponents,
                ...components,
            }}
        />
    </span>;
}
