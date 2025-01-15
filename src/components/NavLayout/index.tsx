import Navigation from "@/components/Navigation";
import React from "react";
import styles from './index.module.scss'
type NavLayoutProps = {
    children: React.ReactNode;
}
const NavLayout = (props: NavLayoutProps) => {
    return <>
        <Navigation />
        <div className={styles.layoutContent}>
            {props.children}
        </div>
    </>
}

export default NavLayout;