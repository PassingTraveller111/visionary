import Image from "next/image";
import React from "react";


const PluginIcon = (props: {
    defaultIcon: string;
}) => {
    const { defaultIcon } = props;
    return <>
        <Image
            src={defaultIcon}
            alt='save'
            width={18} height={18.5}
        />
    </>
}

export default PluginIcon;