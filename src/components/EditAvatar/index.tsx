import React, {useEffect, useState} from 'react';
import {Button, Upload} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import {apiBaseUrl, apiClient, apiList} from "@/clientApi";
import {useAppSelector} from "@/store";
import styles from './index.module.scss';
import {useGetUserInfo} from "@/hooks/users/useUsers";


const App: React.FC = () => {
    const userinfo = useAppSelector(state => state.rootReducer.userReducer.value)
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [isChange, setIsChange] = useState<boolean>(false);
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const getUserData = useGetUserInfo();
    const onChange: UploadProps['onChange'] = async ({ fileList: newFileList }) => {
        setFileList(newFileList);
        if(newFileList[0].xhr){
            const request = newFileList[0].xhr;
            const res = JSON.parse(request.response);
            if(res.data.statusCode === 200)
            setAvatarUrl('https://' + res.data.Location);
        }
        if(newFileList.length > 0) {
            if(newFileList[0]?.url === userinfo.profile) setIsChange(false);
            else setIsChange(true);
        }
    };

    const onReset = () => {
        setFileList([
            {
                uid: '1',
                name: '',
                url: userinfo.profile,
                status: 'done',
            }
        ]);
        setAvatarUrl(userinfo.profile ?? '');
        setIsChange(false);
    };

    const onSave = async () => {
        const res = await apiClient(apiList.post.protected.user.updateUserAvatar, {
            method: 'POST',
            body: JSON.stringify({
                avatarUrl,
            }),
        })
        console.log(res);
        getUserData();
    }

    useEffect(() => {
        onReset();
    }, [userinfo]);

    // 处理图片点击事件
    const handleImageClick = () => {
        // 找到上传按钮并模拟点击
        const uploadButton = document.querySelector('.ant-upload input[type="file"]');
        if (uploadButton) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            uploadButton.click();
        }
    };
    return (
        <span className={styles.uploadContainer}>
            <div className={styles['avatar-container']}>
                <ImgCrop>
                         <Upload
                             action={apiBaseUrl + apiList.post.protected.cos.upload}
                             listType="picture-card"
                             fileList={fileList}
                             onChange={onChange}
                             accept='image/*'
                             maxCount={1}
                         />
                </ImgCrop>
                <span className={styles['avatar-hover']} onClick={handleImageClick}>点击修改头像</span>
            </div>
            {isChange && <Button onClick={onReset}>重置</Button>}
            {isChange && <Button onClick={onSave}>保存</Button>}
        </span>
    );
};

export default App;

