import Image from "next/image";
import React from "react";

export type LogoIconProps = {
    width?: number | `${number}`;
    height?: number | `${number}`;
}

export const LogoIcon = (props: LogoIconProps) => {
    const { width = 40, height = 40 } = props;
    return <Image src='/logo.svg' alt='' width={width} height={height}></Image>
}