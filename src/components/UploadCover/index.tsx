import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Image, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import {apiBaseUrl} from "@/clientApi";
import styles from './index.module.scss';

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

type uploadToDirType = 'article' | 'columns'

const UploadCover = (props: { onChange?: (fileList: UploadFile[]) => void, initValue?: string, uploadToDir?: uploadToDirType}) => {
    const { uploadToDir = 'article' } = props;
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState(props.initValue ?? '');
    const initFileList = props.initValue ? [{
        thumbUrl: props.initValue ?? '',
        uid: '',
        name: '',
        url: props.initValue ?? '',
    }] : []
    const [fileList, setFileList] = useState<UploadFile[]>(initFileList);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        if(props.onChange) props.onChange(newFileList);
    }

    const uploadButton = (
        <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传封面</div>
        </button>
    );
    const uploadAction = uploadToDir === 'article'
        ? `${apiBaseUrl}articles/cover`
        : `${apiBaseUrl}columns/cover`;

    return (
        <>
            <Upload
                className={styles.upload}
                action={uploadAction}
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
            >
                {fileList.length >= 1 ? null : uploadButton}
            </Upload>
            {previewImage && (
                <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                    alt=""
                />
            )}
        </>
    );
};

export default UploadCover;
