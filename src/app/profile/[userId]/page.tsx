"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import {useParams, useRouter} from "next/navigation";
import { useEffect, useState } from "react";
import {apiClient, apiList} from "@/clientApi";
import Image from "next/image";
import moment from "moment";
import {useIsUserOwn} from "@/hooks/users/useUsers";
import {Dropdown, MenuProps, Modal, message} from "antd";
import moreIcon from '../../../../public/icon/more.svg';
import {useDelArticle} from "@/hooks/articles/useArticles";
import {HookAPI} from "antd/es/modal/useModal";
import {MessageInstance} from "antd/es/message/interface";

type articleType = {
    title: string;
    id: number;
    updated_time: string;
}

const ProfilePage = () => {
    const router = useRouter();
    const isOwn = useIsUserOwn();
    const { userId } =  useParams();
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();
    const [profileInfo, setProfileInfo ] = useState({
        nick_name: '',
        username: '',
        id: 0,
        profile: '',
    });
    const [articleList, setArticleList] = useState([]);
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
        router.push('/profile/myData');
    }
    const getArticleList = async () => {
        apiClient(apiList.get.protected.article.getMyArticleList).then(res => {
            setArticleList(res.data);
        })
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
        getArticleList();
    }, [userId])
    return <>
        {modalContextHolder}
        {messageContextHolder}
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
                    {articleList.map((article: articleType) => {
                        return <div key={article.id} className={styles['articleList-item']}
                            onClick={() => {
                                window.open('/reader/' + article.id);
                            }}
                        >
                            <div>
                                <div className={styles['article-title']}>{article.title}</div>
                                <div className={styles['article-date']}>{moment(article.updated_time).format('YYYY-MM-DD HH:mm')}</div>
                            </div>
                            <div className={styles['article-menu']} onClick={(e) => {e.stopPropagation()}}>
                                {isMyProfile && <ArticleItemMenu messageApi={messageApi} modalApi={modalApi}  articleId={article.id} getArticleList={getArticleList} />}
                            </div>
                        </div>
                    })}
                </div>
            </div>
        </NavLayout>
    </>
}


const ArticleItemMenu = (props: { articleId: number, modalApi: HookAPI, messageApi: MessageInstance, getArticleList: () => void }) => {
    const { articleId, modalApi, messageApi, getArticleList } = props;
    const delArticle = useDelArticle();
    const items: MenuProps['items'] = [
        {
            key: 'edit',
            label: (
                <span onClick={() => {
                    window.open('/editor/' + props.articleId);
                }}>编辑</span>
            ),
        },
        {
            key: '2',
            label: (
                <span onClick={async (e) => {
                    e.stopPropagation();
                    const confirm = await modalApi.confirm({
                        title: '删除',
                        content: <span>确定要删除吗</span>,
                        okText: '确定',
                        cancelText: '取消',
                    });
                    if(confirm) {
                        delArticle(articleId).then(res => {
                            if(res.msg === 'success') {
                                messageApi.success('删除成功');
                            } else {
                                messageApi.error('删除失败');
                            }
                            getArticleList();
                        })
                    }
                }}>
                    删除
                </span>
            ),
        },
    ];
    return <>
            <Dropdown menu={{items}}>
                <Image src={moreIcon} alt='更多' width={30} height={30} />
            </Dropdown>
        </>
}

export default ProfilePage;