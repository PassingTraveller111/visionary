'use client'
import NavLayout from "@/components/NavLayout";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import styles from './index.module.scss';
import {useAppSelector} from "@/store";
import Image from "next/image";
import {Card, Col, Row, Statistic} from "antd";
import {useEffect, useState} from "react";
import {apiClient, apiList} from "@/clientApi";
import {getUserStatisticResType} from "@/app/api/protected/user/getUserStatistic/route";
import StatisticLineChart from "@/components/StatisticLineChart";

const HomePage = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);
    const [userStatistic, setUserStatistic] = useState<{
        days_count: number;
        articles_count: number;
        likes_count: number;
        looks_count: number;
        collections_count: number;
    }>({
        days_count: 0, articles_count: 0, collections_count: 0, likes_count: 0, looks_count: 0
    });
    useEffect(() => {
        apiClient(apiList.get.protected.user.getUserStatistic).then((res: getUserStatisticResType)  => {
            if(res.msg === 'success'){
                setUserStatistic(res.data);
            }
        })
    }, []);
    return  <NavLayout>
        <CreatorSideBarLayout
            selectedMenuKey='home'
        >
        <div
            className={styles.container}
        >
            <div className={styles.content}>
                <div className={styles.userInfo}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Card>
                                <div className={styles.left}>
                                    <div className={styles.avatar}>
                                        {userInfo.profile &&
                                            <Image src={userInfo.profile} alt={''} width={100} height={100}/>}
                                    </div>
                                    <div className={styles.info}>
                                        <div className={styles.nickname}>
                                            {userInfo.nick_name}
                                        </div>
                                        <div className={styles.username}>
                                            {userInfo.username}
                                        </div>
                                        <div className={styles.email}>
                                            {userInfo.email}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card>
                                <div className={styles.days}>
                                    <div className={styles.top}>来到创见已经</div>
                                    <div className={styles.bottom}>{userStatistic.days_count}天</div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </div>
                <div className={styles.statistic}>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="总文章数"
                                    value={userStatistic.articles_count}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="总点赞数"
                                    value={userStatistic.likes_count}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="总阅读数"
                                    value={userStatistic.looks_count}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="总收藏数"
                                    value={userStatistic.collections_count}
                                />
                            </Card>
                        </Col>
                        {/*<Col span={8}>*/}
                        {/*    <Card>*/}
                        {/*        <Statistic*/}
                        {/*            title="总评论数"*/}
                        {/*            value={userStatistic.collections_count}*/}
                        {/*        />*/}
                        {/*    </Card>*/}
                        {/*</Col>*/}
                    </Row>
                </div>
                <div className={styles.statisticCharts}>
                    <Card>
                        <StatisticLineChart/>
                    </Card>
                </div>
            </div>
        </div>
        </CreatorSideBarLayout>
    </NavLayout>
}

export default HomePage;