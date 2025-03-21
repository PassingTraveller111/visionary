import {getSystemType} from "@/components/MdEditor/plugins/utils";

const systemType = getSystemType();
const controlKey = systemType === 'mac' ? 'metaKey' : 'ctrlKey' // meta就是command一般与win的ctrl键对应

export type withKeyType = 'metaKey' | 'altKey' | 'ctrlKey' | 'shiftKey';
export type ShortcutKeyType = {
        key: string; // 按键
        code: string; // 按键的code
        withKey: withKeyType [] // mac的option就是alt
    };

export const shortcutKeys: {
    [key: string]: ShortcutKeyType
} = {
    bold: {
        key: 'b',
        code: 'KeyB',
        withKey: [controlKey]
    },
    italic: {
        key: 'i',
        code: 'KeyI',
        withKey: [controlKey]
    },
    link: {
        key: 'k',
        code: 'KeyK',
        withKey: [controlKey]
    },
    ol: {
        key: 'o',
        code: 'KeyO',
        withKey: ['shiftKey', controlKey]
    },
    ul: {
        key: 'u',
        code: 'KeyU',
        withKey: ['shiftKey', controlKey]
    },
    lineCode: {
        key: 'k',
        code: 'KeyK',
        withKey: ['shiftKey', controlKey]
    },
    blockCode: {
        key: 'c',
        code: 'KeyC',
        withKey: ['shiftKey', controlKey]
    },
    table: {
        key: 't',
        code: 'KeyT',
        withKey: ['altKey', controlKey]
    },
    image: {
        key: 'i',
        code: 'KeyI',
        withKey: ['shiftKey', controlKey]
    },
    tab: {
        key: 'tab',
        code: 'Tab',
        withKey: [],
    },
    find: {
        key: 'f',
        code: 'KeyF',
        withKey: [controlKey],
    },
    title0: {
        key: '0',
        code: 'Digit0',
        withKey: [controlKey]
    },
    title1: {
        key: '1',
        code: 'Digit1',
        withKey: [controlKey]
    },
    title2: {
        key: '2',
        code: 'Digit2',
        withKey: [controlKey]
    },
    title3: {
        key: '3',
        code: 'Digit3',
        withKey: [controlKey]
    },
    title4: {
        key: '4',
        code: 'Digit4',
        withKey: [controlKey]
    },
    title5: {
        key: '5',
        code: 'Digit5',
        withKey: [controlKey]
    },
    title6: {
        key: '6',
        code: 'Digit6',
        withKey: [controlKey]
    },
}

export const shortcutKeysToStrings = Object.assign({}, ...Object.keys(shortcutKeys).map(key => {
    const item = shortcutKeys[key];
    return {
        [key]: `${item.withKey?.map(key => {
            return {
                'metaKey': 'command',
                'ctrlKey': 'ctrl',
                'altKey': systemType === 'mac' ? 'option' : 'alt',
                'shiftKey': 'shift',
            }[key]
        }).join('+')}+${item.key}`,
    }
}))

export const shortcutKeyAccess = (event: KeyboardEvent, shortcutKey: ShortcutKeyType )=>{
    const { code, withKey } = shortcutKey;
    return (['metaKey', 'altKey', 'ctrlKey', 'shiftKey'] as withKeyType[]).every(key => {
        // withKey有的得是true并且没有的得是false
        if(withKey.includes(key)) return event[key];
        else return !event[key];
    }) && event.code === code;
}
