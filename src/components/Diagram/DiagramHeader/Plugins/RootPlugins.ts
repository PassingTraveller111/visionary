import TextAlignPlugin from "@/components/Diagram/DiagramHeader/Plugins/TextAlignPlugin";
import {configType} from "@/components/Diagram/DiagramHeader/Plugins/type";
import LineTypePlugin from "@/components/Diagram/DiagramHeader/Plugins/LineTypePlugin";
import TextFontSizePlugin from "@/components/Diagram/DiagramHeader/Plugins/TextFontSizePlugin";


const rootPlugins = [
    // 字体相关
    TextAlignPlugin,
    TextFontSizePlugin,
    // 连线相关
    LineTypePlugin,
];

const defaultPluginConfig: configType = {
    name: '',
    align: 'left'
}

rootPlugins.map(Plugin => {
    return Plugin.config = {
        ...defaultPluginConfig,
        ...Plugin.config,
    }
})
export default rootPlugins;