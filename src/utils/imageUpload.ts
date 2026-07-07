export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

const imageTypes = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
} as const;

export type AllowedImageMimeType = keyof typeof imageTypes;

export const getImageExtension = (mimeType: AllowedImageMimeType) => imageTypes[mimeType];

const startsWithBytes = (bytes: Uint8Array, signature: number[]) => {
    return signature.every((value, index) => bytes[index] === value);
}

export const detectImageMimeType = (buffer: ArrayBuffer): AllowedImageMimeType | null => {
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 12) return null;

    if (startsWithBytes(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg';
    if (startsWithBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png';
    if (startsWithBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) || startsWithBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])) return 'image/gif';
    if (
        startsWithBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
        bytes[8] === 0x57 &&
        bytes[9] === 0x45 &&
        bytes[10] === 0x42 &&
        bytes[11] === 0x50
    ) {
        return 'image/webp';
    }

    return null;
}

export const validateImageFile = async (file: File) => {
    if (file.size <= 0) return { error: '图片文件为空' } as const;
    if (file.size > MAX_IMAGE_FILE_SIZE) return { error: '图片大小不能超过 5MB' } as const;

    const buffer = await file.arrayBuffer();
    const mimeType = detectImageMimeType(buffer);
    if (!mimeType) return { error: '仅支持 JPG、PNG、GIF、WebP 图片' } as const;
    if (file.type && file.type !== mimeType) return { error: '图片类型与文件内容不匹配' } as const;

    return { buffer, mimeType, extension: getImageExtension(mimeType) } as const;
}
