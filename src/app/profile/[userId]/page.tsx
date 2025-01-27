"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import {useAppSelector} from "@/store";
import {useParams, useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {apiClient, apiList} from "@/clientApi";

const ProfilePage = () => {
    const router = useRouter();
    const { userId } =  useParams();
    const [profileInfo, setProfileInfo ] = useState({
        nick_name: '',
        username: '',
        id: 0,
        profile: '',
    });
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const isMyProfile = Number(userId) === userInfo.id;
    console.log('isMyProfile', isMyProfile);
    const renderUserName = () => {
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
    }
    const gotoMyData = () => {
        router.push(`/profile/myData/${profileInfo.id}`);
    }
    useEffect(() => {
        apiClient(apiList.post.protected.profile.getProfile, {
            method: 'POST',
            body: JSON.stringify({
                userId,
            }),
        }).then(res => {
            setProfileInfo(res.data);
        })
    }, [userId])
    return <>
        <NavLayout>
            <div className={styles['profile-container']}>
                <div className={styles['profile-content']}>
                    <div className={styles['profile-description']}>
                        <span className={styles.descriptionLeft}>
                            <img src={profileInfo.profile} alt="profile"/>
                        </span>
                        <span className={styles.descriptionRight}>
                            {renderUserName()}
                            <span
                                className={styles.edit}
                                onClick={gotoMyData}
                            >编辑</span>
                        </span>
                    </div>
                    <div>
                        我的文章
                    </div>
                </div>
            </div>
        </NavLayout>

    </>
}

export default ProfilePage;