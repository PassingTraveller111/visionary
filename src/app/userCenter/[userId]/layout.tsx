"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { apiClient, apiList } from "@/clientApi";
import Image from "next/image";
import { useIsUserOwn } from "@/hooks/users/useUsers";
import { Tabs } from "antd";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";

type UserCenterLayoutProps = {
    children: React.ReactNode;
};

const UserCenterLayOut = (props: UserCenterLayoutProps) => {
    const { children } = props;
    const router = useRouter();
    const userId = Number(useParams().userId);
    const pathname = usePathname();
    // 去除路径名前面的斜杠并按斜杠分割成数组
    const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
    // 获取数组的最后一个元素
    const lastSegment = pathSegments[pathSegments.length - 1];
    // 使用 useCallback 确保 onChange 函数稳定
    const handleTabChange = useCallback((tabKey: string) => {
        router.push(`/userCenter/${userId}/${tabKey}`);
    }, [router, userId]);

    return (
        <>
            <NavLayout>
                <div className={styles['profile-container']}>
                    <UserInfoBar userId={userId} router={router} />
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
                            },
                            {
                                key: 'column',
                                label: '专栏'
                            }
                        ]}
                        onChange={handleTabChange}
                    />
                    {children}
                </div>
            </NavLayout>
        </>
    );
};

export default UserCenterLayOut;

const UserInfoBar = React.memo(function UserInfoBar(props: { userId: number, router: AppRouterInstance }) {
    const { userId, router } = props;
    const isOwn = useIsUserOwn();
    const [profileInfo, setProfileInfo] = useState({
        nick_name: '',
        username: '',
        id: 0,
        profile: '',
    });

    // 将 fetchProfileInfo 定义移出 useEffect
    const fetchProfileInfo = useCallback(() => {
        apiClient(apiList.post.protected.profile.getProfile, {
            method: 'POST',
            body: JSON.stringify({
                userId,
            }),
        }).then(res => {
            setProfileInfo(res.data);
        });
    }, [userId]);

    // 只在组件首次加载时调用 fetchProfileInfo
    useEffect(() => {
        fetchProfileInfo();
    }, [fetchProfileInfo]);

    // 其他逻辑保持不变
    const isMyProfile = useMemo(() => {
        return isOwn(Number(userId) as string | number);
    }, [isOwn, userId]);

    const renderUserName = useMemo(() => {
        let largeName = '';
        let smallName = '';
        if (profileInfo.nick_name) {
            largeName = profileInfo.nick_name;
            smallName = profileInfo.username ?? '';
        } else {
            largeName = profileInfo.username ?? '';
        }
        return (
            <span className={styles.name}>
                <span className={styles.largeName}>{largeName}</span>
                <span className={styles.smallName}>{smallName}</span>
            </span>
        );
    }, [profileInfo]);

    const gotoMyData = useCallback(() => {
        router.push('/userCenter/myData');
    }, [router]);

    return (
        <div className={styles['profile-content']}>
            <div className={styles['profile-description']}>
                <span className={styles.descriptionLeft}>
                    {profileInfo.profile && (
                        <Image src={profileInfo.profile} alt="profile" width={120} height={120} />
                    )}
                </span>
                <span className={styles.descriptionRight}>
                    {renderUserName}
                    {isMyProfile && (
                        <span
                            className={styles.edit}
                            onClick={gotoMyData}
                        >
                            编辑
                        </span>
                    )}
                </span>
            </div>
        </div>
    );
});