'use client'
import NavLayout from "@/components/NavLayout";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import styles from './index.module.scss';
import {useAppSelector} from "@/store";
import Image from "next/image";
import {Card, Col, Row, Statistic} from "antd";

const HomePage = () => {
    const userInfo = useAppSelector(state => state.rootReducer.userReducer.value);

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
                                    <div className={styles.bottom}>100天</div>
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
                                    value={11}
                                    precision={2}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="总点赞数"
                                    value={11}
                                    precision={2}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card>
                                <Statistic
                                    title="总阅读数"
                                    value={11}
                                    precision={2}
                                />
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
        </CreatorSideBarLayout>
    </NavLayout>
}

export default HomePage;