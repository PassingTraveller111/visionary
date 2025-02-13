import Image from "next/image";
import React, {useState} from "react";


const PluginIcon = (props: {
    defaultIcon: string;
    hoverIcon: string;
}) => {
    const [hover, setHover] = useState(false);
    const { defaultIcon, hoverIcon } = props;
    return <>
        <Image
            src={hover ? hoverIcon : defaultIcon}
            alt='save'
            width={18} height={18.5}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        />
    </>
}

export default PluginIcon;