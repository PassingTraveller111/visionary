import {useAppSelector} from "@/store";
import {Button, Divider, Popover} from "antd";
import React from "react";
import {UserInfoType} from "@/store/features/userSlice";
import {useUserLogout} from "@/hooks/users/useUsers";
import styles from './index.module.scss';
import {useRouter} from "next/navigation";
import Image from "next/image";
import {IconFont} from "@/components/IconFont";

type ProfileProps = {
    width?: number;
    height?: number;
}
type ProfilePopoverProps = {
    children?: React.ReactNode;
    userInfo: UserInfoType;
}
export const Profile = (props: ProfileProps) => {
    const { width=30, height=30 } = props;
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);

    return <ProfilePopover
        userInfo={userInfo}
    >
        {userInfo.profile && <Image src={userInfo.profile} alt="profile" width={width} height={height} style={{ cursor: "pointer"}} />}
    </ProfilePopover>
}

const ProfilePopover = (props: ProfilePopoverProps) => {
    const { children, userInfo } = props;
    const logout = useUserLogout();
    const router = useRouter();
    const content = <div className={styles.ProfilePopoverContent}>
        <div className={styles.contentTop}>
            {userInfo.profile && <Image className={styles.ProfileImg} src={userInfo.profile} alt="profile" width={50} height={50}/>}
            <div className={styles.ProfileNickName}>
                {userInfo.nick_name}
                <div className={styles.ProfileUserName}>
                    {userInfo.username}
                </div>
            </div>
        </div>
        <Divider/>
        <div className={styles.contentCenter}>
            <span
                className={styles.menuItem}
                onClick={() => router.push(`/userCenter/${userInfo.id}/article`)}
            >
                <IconFont type='icon-userCenter'/>
                <span className={styles.label}>我的主页</span>
            </span>
            <span
                className={styles.menuItem}
                onClick={() => router.push(`/userCenter/readHistory`)}
            >
                <IconFont type='icon-history'/>
                <span className={styles.label}>历史记录</span>
            </span>
        </div>
        <Divider/>
        <div className={styles.contentBottom}>
            <Button onClick={() => logout()}>logout</Button>
        </div>
    </div>
    return <Popover
        arrow={false}
        trigger="click"
        content={content}
        placement="bottomRight"
    >
        {children}
    </Popover>
}