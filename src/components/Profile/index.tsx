import {useAppSelector} from "@/store";
import {Button, Divider, Popover} from "antd";
import React from "react";
import {UserInfoType} from "@/store/features/userSlice";
import {useUserLogout} from "@/hooks/users/useUsers";
import styles from './index.module.scss';
import {useRouter} from "next/navigation";

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
        <img src={userInfo.profile} alt="profile" style={{width: width, height: height, cursor: "pointer"}} />
    </ProfilePopover>
}

const ProfilePopover = (props: ProfilePopoverProps) => {
    const { children, userInfo } = props;
    const logout = useUserLogout();
    const router = useRouter();
    const content = <div className={styles.ProfilePopoverContent}>
        <div className={styles.contentTop}>
            <img className={styles.ProfileImg} src={userInfo.profile} alt="profile"/>
            <div className={styles.ProfileName}>
                {userInfo.username}
            </div>
        </div>
        <Divider/>
        <div className={styles.contentCenter} onClick={() => router.push('/profile')}>
            <span>我的主页</span>
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