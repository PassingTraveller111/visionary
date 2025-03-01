import { KeyboardEventCondition } from "react-markdown-editor-lite/cjs/share/var";
import {getSystemType} from "@/components/MdEditor/plugins/utils";

const systemType = getSystemType();
console.log(systemType);

export const shortcutKeys: {
    [key: string]: KeyboardEventCondition;
} = {
    bold: {
        key: 'b',
        keyCode: 66,
        withKey: systemType === 'mac' ? ['metaKey'] : ['ctrlKey']
    },
    italic: {
        key: 'i',
        keyCode: 0,
        withKey: systemType === 'mac' ? ['metaKey'] : ['ctrlKey']
    },
    del: {
        key: '5',
        keyCode: 0,
        withKey: ['shiftKey', 'altKey']
    }
}

export const shortcutKeysToStrings = Object.assign({}, ...Object.keys(shortcutKeys).map(key => {
    const item = shortcutKeys[key];
    return {
        [key]: `${item.withKey?.map(key => {
            return key.slice(0, key.length - 3);
        }).join('，')}+${item.key}`,
    }
}))

console.log(shortcutKeysToStrings);
