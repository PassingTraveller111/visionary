import {shortcutKeys, shortcutKeysToStrings} from "@/components/MdEditor/plugins/shortcutKeys";
import React from "react";


export const PluginTitle = (props: {title: string, keyName?: keyof typeof shortcutKeys}) => {
    const {title, keyName} = props;
    return <div
        style={{
            textAlign: "center",
        }}
    >
        <div>{title}</div>
        {keyName && <div>{shortcutKeysToStrings[keyName]}</div>}
    </div>
}