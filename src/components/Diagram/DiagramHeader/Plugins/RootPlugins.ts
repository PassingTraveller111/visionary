import TextAlignPlugin from "@/components/Diagram/DiagramHeader/Plugins/TextAlignPlugin";
import {configType} from "@/components/Diagram/DiagramHeader/Plugins/type";
import LineTypePlugin from "@/components/Diagram/DiagramHeader/Plugins/LineTypePlugin";
import TextFontSizePlugin from "@/components/Diagram/DiagramHeader/Plugins/TextFontSizePlugin";
import TextFontBoldPlugin from "@/components/Diagram/DiagramHeader/Plugins/TextFontBoldPlugin";
import TextUnderLinePlugin from "@/components/Diagram/DiagramHeader/Plugins/TextUnderLinePlugin";
import TextColorPlugin from "@/components/Diagram/DiagramHeader/Plugins/TextColorPlugin";


const rootPlugins = [
    // 字体相关
    TextAlignPlugin,
    TextFontSizePlugin,
    TextFontBoldPlugin,
    TextUnderLinePlugin,
    TextColorPlugin,
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