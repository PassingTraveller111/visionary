"use client"
import {Button} from "antd";
import {useUserLogout} from "@/hooks/users/useUsers";
import Navigation from "../components/Navigation";
import axios from "axios";
import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {setUserInfo} from "@/store/features/userSlice";

export default function Home() {
    const dispatch = useDispatch();
    const logout = useUserLogout();
    const onLogOut = () => {
        logout();
    }
    const getUserInfo = async () => {
        const res = await axios.get('http://localhost:3000/api/protected/user/getUserInfo');
        dispatch(setUserInfo(res.data.data));
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
