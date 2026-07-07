import ReactMarkdown, {UrlTransform} from 'react-markdown';
import styles from './index.module.scss';
import rehypeHighlight from "rehype-highlight"; // 添加代码高亮样式
import remarkMath from "remark-math"; // 识别数学公式
import rehypeKatex from "rehype-katex"; // 添加数学公式样式
import remarkGfm from "remark-gfm"; // 识别表格、任务列表等
import ImageComponents from "@/components/ReactMarkdown/components/image";
import rehypeRaw from "rehype-raw";
import PreParseComponents from "@/components/ReactMarkdown/components/PreParse"; // 允许渲染html标签

type HastNode = {
    type?: string;
    tagName?: string;
    value?: string;
    properties?: Record<string, unknown>;
    children?: HastNode[];
}

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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
const MyReactMarkdown = (props) => {
    return <span className={styles.markdown}>
            <ReactMarkdown
                {...props}
                remarkPlugins={[remarkMath, remarkGfm]} // 输入输出为markdown，负责markdown的解析和转换
                rehypePlugins={[rehypeRaw, rehypeSanitizeMarkdownHtml, rehypeHighlight, rehypeKatex]} // 输入和输出为html，负责html的解析和转换
                urlTransform={safeUrlTransform}
                components={{
                    pre: PreParseComponents, // 通过pre标签获得代码块
                    img: ImageComponents,
                    ...props.components,
                }}
            />
    </span>
};

export default MyReactMarkdown;
