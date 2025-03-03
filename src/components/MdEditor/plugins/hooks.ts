import {useCallback, useEffect} from "react";
import Editor from "react-markdown-editor-lite";
import {shortcutKeyAccess, shortcutKeys} from "@/components/MdEditor/plugins/shortcutKeys";


export const useEditorOnKeyDown = (editor: Editor, key: keyof typeof shortcutKeys, handleFunction: (event: KeyboardEvent) => void) => {
    const handleKeyDown = useCallback((event: KeyboardEvent)=>{
        if (shortcutKeyAccess(event, shortcutKeys[key])) {
            handleFunction(event);
        }
    }, [handleFunction, key]);
    useEffect(() => {
        editor.on('keydown', handleKeyDown);
        // 清理函数，在组件卸载时移除事件监听器
        return () => {
            editor.off('keydown', handleKeyDown);
        };
    }, [editor, handleKeyDown]);
}