"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import {useParams, useRouter} from "next/navigation";
import { useEffect, useState } from "react";
import {apiClient, apiList} from "@/clientApi";
import Image from "next/image";
import moment from "moment";
import {useIsUserOwn} from "@/hooks/users/useUsers";
import { useGetArticleList } from "@/hooks/articles/useArticles";
import {Empty} from "antd";



const ProfilePage = () => {
    const router = useRouter();
    const isOwn = useIsUserOwn();
    const { userId } =  useParams();
    const [profileInfo, setProfileInfo ] = useState({
        nick_name: '',
        username: '',
        id: 0,
        profile: '',
    });
    const { articleList, getArticleList } = useGetArticleList();
    const isMyProfile = isOwn(Number(userId) as string | number);
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
        router.push('/userCenter/myData');
    }
    useEffect(() => {
        apiClient(apiList.post.protected.profile.getProfile, {
            method: 'POST',
            body: JSON.stringify({
                userId,
            }),
        }).then(res => {
            setProfileInfo(res.data);
        });
        getArticleList(Number(userId));
    }, [userId])
    return <>
        <NavLayout>
            <div className={styles['profile-container']}>
                <div className={styles['profile-content']}>
                    <div className={styles['profile-description']}>
                        <span className={styles.descriptionLeft}>
                           {profileInfo.profile &&
                               <Image src={profileInfo.profile} alt="profile" width={120} height={120}/>}
                        </span>
                        <span className={styles.descriptionRight}>
                            {renderUserName()}

                            {isMyProfile && <span
                                className={styles.edit}
                                onClick={gotoMyData}
                            >编辑</span>}
                        </span>
                    </div>
                </div>
                <div className={styles['articleList-container']}>
                    {articleList.length === 0 && <Empty />}
                    {articleList.map((article) => {
                        return <div key={article.id} className={styles['articleList-item']}
                            onClick={() => {
                                window.open('/reader/' + article.id);
                            }}
                        >
                            <div>
                                <div className={styles['article-title']}>{article.title}</div>
                                <div className={styles['article-date']}>{moment(article.updated_time).format('YYYY-MM-DD HH:mm')}</div>
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </NavLayout>
    </>
}

export default ProfilePage;


