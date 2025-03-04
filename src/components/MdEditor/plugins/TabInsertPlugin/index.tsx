'use client'
import React from 'react';
import { PluginProps } from 'react-markdown-editor-lite';
import {useEditorOnKeyDown} from "@/components/MdEditor/plugins/hooks";
import {insertTab} from "@/components/MdEditor/plugins/utils";

const TabInsertPlugin = (props: PluginProps) => {
    const { editor } = props;
    useEditorOnKeyDown(editor, 'tab', (event) => {
        event.preventDefault();
        insertTab(editor);
    });
    return <></>
}
TabInsertPlugin.align = 'left';
TabInsertPlugin.pluginName = 'TabInsertPlugin';


export default TabInsertPlugin;


