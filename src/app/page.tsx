"use client"
import {useGetUserInfo} from "@/hooks/users/useUsers";
import {useEffect} from "react";
import NavLayout from "@/components/NavLayout";

export default function Home() {
    const getUserInfo = useGetUserInfo();
    useEffect(() => {
        getUserInfo();
    }, [])
  return (
        <div>
            <NavLayout>
                <div>
                    content
                </div>
            </NavLayout>
        </div>
  );
}
