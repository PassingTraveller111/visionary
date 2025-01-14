"use client"
import {Button} from "antd";
import {useGetUserInfo, useUserLogout} from "@/hooks/users/useUsers";
import Navigation from "../components/Navigation";
import {useEffect} from "react";

export default function Home() {
    const getUserInfo = useGetUserInfo();
    useEffect(() => {
        getUserInfo();
    }, [])
  return (
        <div>
          <Navigation/>
            <div>
                content
            </div>
        </div>
  );
}
