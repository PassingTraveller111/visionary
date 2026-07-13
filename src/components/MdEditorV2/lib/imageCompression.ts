export const EDITOR_IMAGE_UPLOAD_LIMIT = 1024 * 1024;

const MAX_COMPRESSED_IMAGE_EDGE = 1600;
const COMPRESSED_IMAGE_QUALITY = 0.82;
const COMPRESSIBLE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const blobToFile = (blob: Blob, sourceFile: File, type: string) => {
    const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
    const fileName = sourceFile.name.replace(/\.[^.]*$/, '') || 'image';
    return new File([blob], `${fileName}.${extension}`, {
        type,
        lastModified: Date.now(),
    });
}

const loadImageElement = (file: File) => new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
    };
    image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('图片加载失败'));
    };
    image.src = url;
});

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality: number) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('图片压缩失败'));
    }, type, quality);
});

export const compressImageFile = async (file: File) => {
    if (!COMPRESSIBLE_IMAGE_TYPES.has(file.type)) {
        return { error: '图片超过 1MB，仅支持自动压缩 JPG、PNG、WebP 图片' } as const;
    }

    const image = await loadImageElement(file);
    const scale = Math.min(1, MAX_COMPRESSED_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return { error: '图片压缩失败' } as const;

    context.drawImage(image, 0, 0, width, height);
    let type = file.type;
    let quality = COMPRESSED_IMAGE_QUALITY;

    for (let index = 0; index < 4; index += 1) {
        const blob = await canvasToBlob(canvas, type, quality);
        if (blob.size <= EDITOR_IMAGE_UPLOAD_LIMIT || index === 3) {
            return { file: blobToFile(blob, file, type) } as const;
        }

        type = 'image/jpeg';
        quality -= 0.12;
    }

    return { error: '图片压缩失败' } as const;
}
