"use client"
import NavLayout from "@/components/NavLayout";
import styles from "./index.module.scss";
import { Modal, message} from "antd";
import {useAppSelector} from "@/store";
import CreatorSideBarLayout from "@/components/CreatorSideBarLayout";
import CreatorList from "@/components/CreatorList";



const DiagramPage = () => {
    const { id: userId, isLoading } = useAppSelector(state => state.rootReducer.userReducer.value);
    const [modalApi, modalContextHolder] = Modal.useModal();
    const [messageApi, messageContextHolder] = message.useMessage();


    return <>
        {modalContextHolder}
        {messageContextHolder}
        <NavLayout>
            <CreatorSideBarLayout
                selectedMenuKey='diagram'
            >
                <CreatorList
                    NavLeftContent={'图表管理'}
                    ListContent={
                        <div className={styles['articleList-container']}>
                        </div>
                    }
                />
            </CreatorSideBarLayout>
        </NavLayout>
    </>
}






export default DiagramPage;

