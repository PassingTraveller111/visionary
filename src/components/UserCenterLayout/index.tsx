"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import {useParams, usePathname, useRouter} from "next/navigation";
import React, {useEffect, useMemo, useState} from "react";
import {apiClient, apiList} from "@/clientApi";
import Image from "next/image";
import {useIsUserOwn} from "@/hooks/users/useUsers";
import {Tabs} from "antd";

type UserCenterLayoutProps = {
    children: React.ReactNode;
}

const UserCenterLayOut = (props: UserCenterLayoutProps) => {
    const { children } = props;
    const router = useRouter();
    const userId =  Number(useParams().userId);
    const pathname = usePathname();
    // 去除路径名前面的斜杠并按斜杠分割成数组
    const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
    // 获取数组的最后一个元素
    const lastSegment = pathSegments[pathSegments.length - 1];

    return <>
        <NavLayout>
            <div className={styles['profile-container']}>
                <UserInfoBar/>
                <Tabs
                    className={styles.tabsNav}
                    defaultActiveKey={lastSegment}
                    items={[
                        {
                            key: 'article',
                            label: '文章',
                        },
                        {
                            key: 'collect',
                            label: '收藏'
                        }
                    ]}
                    onChange={(tabKey) => {
                        router.push(`/userCenter/${userId}/${tabKey}`);
                    }}
                />
                {children}
            </div>
        </NavLayout>
    </>
}

export default UserCenterLayOut;


const UserInfoBar = () => {
    const isOwn = useIsUserOwn();
    const router = useRouter();
    const { userId } =  useParams();
    const [profileInfo, setProfileInfo ] = useState({
        nick_name: '',
        username: '',
        id: 0,
        profile: '',
    });
    useEffect(() => {
        apiClient(apiList.post.protected.profile.getProfile, {
            method: 'POST',
            body: JSON.stringify({
                userId,
            }),
        }).then(res => {
            setProfileInfo(res.data);
        });
    }, [userId])
    const isMyProfile = useMemo(() => {
        return isOwn(Number(userId) as string | number);
    }, [isOwn, userId])
    const renderUserName = useMemo(() => {
        let largeName = '';
        let smallName = '';
        if (profileInfo.nick_name) {
            largeName = profileInfo.nick_name;
            smallName = profileInfo.username ?? '';
        } else {
            largeName = profileInfo.username ?? '';
        }
        return <span className={styles.name}>
            <span className={styles.largeName} >{largeName}</span>
            <span className={styles.smallName}>{smallName}</span>
        </span>
    }, [profileInfo])
    const gotoMyData = () => {
        router.push('/userCenter/myData');
    }
    return <div className={styles['profile-content']}>
        <div className={styles['profile-description']}>
                        <span className={styles.descriptionLeft}>
                           {profileInfo.profile &&
                               <Image src={profileInfo.profile} alt="profile" width={120} height={120}/>}
                        </span>
            <span className={styles.descriptionRight}>
                            {renderUserName}
                {isMyProfile && <span
                    className={styles.edit}
                    onClick={gotoMyData}
                >编辑</span>}
            </span>
        </div>
    </div>

}


