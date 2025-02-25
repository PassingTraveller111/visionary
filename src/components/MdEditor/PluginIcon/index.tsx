import Image from "next/image";
import React from "react";


const PluginIcon = (props: {
    defaultIcon: string;
    width?: number;
    height?: number;
}) => {
    const { defaultIcon, width = 18, height = 18 } = props;
    return <>
        <Image
            src={defaultIcon}
            alt='save'
            width={width}
            height={height}
        />
    </>
}

export default PluginIcon;