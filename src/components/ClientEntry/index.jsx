'use client';
import { useEffect } from 'react';
import {useGetUserInfo} from "../../hooks/users/useUsers";

export default function ClientEntry() {
    const getUserDate =  useGetUserInfo();
    useEffect(() => {
        getUserDate();
    }, []);
    return <></>;
}