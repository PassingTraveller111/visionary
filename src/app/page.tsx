"use client"
import {Button} from "antd";
import {useUserLogout} from "@/hooks/users/useUsers";

export default function Home() {
    const logout = useUserLogout();
    const onLogOut = () => {
        logout();
    }
  return (
        <div>
          hello
          <Button onClick={onLogOut}>logout</Button>
        </div>
  );
}
