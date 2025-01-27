"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import {useAppSelector} from "@/store";

const ProfilePage = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    return <>
        <NavLayout>
            <div className={styles['profile-container']}>
                <div className={styles['profile-content']}>
                    <div className={styles['profile-description']}>
                        <img src={userInfo.profile} alt="profile" />
                        <span>{userInfo.username}</span>
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