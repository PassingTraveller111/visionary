'use client';
import { useEffect } from 'react';
import {useGetUserInfo} from "../../hooks/users/useUsers";
import '@ant-design/v5-patch-for-react-19'; // antV5版本兼容react19

export default function ClientEntry() {
    const getUserDate =  useGetUserInfo();
    useEffect(() => {
        getUserDate();
    }, []);
    return <></>;
}