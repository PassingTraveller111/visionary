import {ComponentType} from "@/components/ReactMarkdown/components/type";
import { Image } from "antd";
import styles from './index.module.scss';

const sanitizeDimension = (value: unknown) => {
    if (typeof value === 'number') return value > 0 && value <= 4096 ? value : undefined;
    if (typeof value !== 'string') return undefined;
    if (/^\d{1,4}$/.test(value)) return Number(value) <= 4096 ? value : undefined;
    if (/^(100|[1-9]?\d)%$/.test(value)) return value;
    return undefined;
}

const sanitizeImageUrl = (value: unknown) => {
    if (typeof value !== 'string') return undefined;
    const url = value.trim();
    if (!url || url.startsWith('//')) return undefined;
    const normalized = url.replace(/[\u0000-\u001F\u007F\s]+/g, '').toLowerCase();
    if (normalized.startsWith('javascript:') || normalized.startsWith('data:') || normalized.startsWith('vbscript:') || normalized.startsWith('file:')) {
        return undefined;
    }
    const protocol = /^[A-Za-z][A-Za-z\d+.-]*:/.exec(url)?.[0].toLowerCase();
    if (!protocol || ['http:', 'https:'].includes(protocol)) return url;
    return undefined;
}

const ImageComponents: ComponentType  = ({ node }) => {
    const properties = node?.properties ?? {};
    const src = sanitizeImageUrl(properties.src);
    if (!src) return null;

    return <span className={styles.imgContainer}>
        <Image
            alt={typeof properties.alt === 'string' ? properties.alt : ''}
            src={src}
            title={typeof properties.title === 'string' ? properties.title : undefined}
            width={sanitizeDimension(properties.width)}
            height={sanitizeDimension(properties.height)}
        />
    </span>
}

export default ImageComponents;
