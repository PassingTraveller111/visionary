"use client"
import {Button} from "antd";
import {useGetUserInfo, useUserLogout} from "@/hooks/users/useUsers";
import Navigation from "../components/Navigation";
import {useEffect} from "react";

export default function Home() {
    const logout = useUserLogout();
    const getUserInfo = useGetUserInfo();
    const onLogOut = () => {
        logout();
    }
    useEffect(() => {
        getUserInfo();
    }, [])
  return (
        <div>
          <Navigation/>
            <div>
                content
                <Button onClick={onLogOut}>logout</Button>
            </div>
        </div>
  );
}
