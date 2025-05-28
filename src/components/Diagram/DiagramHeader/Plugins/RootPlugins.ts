import TextAlignPlugin from "@/components/Diagram/DiagramHeader/Plugins/TextAlignPlugin";
import {configType} from "@/components/Diagram/DiagramHeader/Plugins/type";
import LineTypePlugin from "@/components/Diagram/DiagramHeader/Plugins/LineTypePlugin";
import TextFontSizePlugin from "@/components/Diagram/DiagramHeader/Plugins/TextFontSizePlugin";
import TextFontBoldPlugin from "@/components/Diagram/DiagramHeader/Plugins/TextFontBoldPlugin";
import TextUnderLinePlugin from "@/components/Diagram/DiagramHeader/Plugins/TextUnderLinePlugin";
import TextColorPlugin from "@/components/Diagram/DiagramHeader/Plugins/TextColorPlugin";
import TextLineHeightPlugin from "@/components/Diagram/DiagramHeader/Plugins/TextLineHeightPlugin";
import LineColorPlugin from "@/components/Diagram/DiagramHeader/Plugins/LineColorPlugin";
import LineWidthPlugin from "@/components/Diagram/DiagramHeader/Plugins/LineWidthPlugin";
import FillColorPlugin from "@/components/Diagram/DiagramHeader/Plugins/FillColorPlugin";


const rootPlugins = [
    // 字体相关
    TextAlignPlugin,
    TextFontSizePlugin,
    TextFontBoldPlugin,
    TextUnderLinePlugin,
    TextColorPlugin,
    TextLineHeightPlugin,
    FillColorPlugin,
    // 连线相关
    LineTypePlugin,
    LineColorPlugin,
    LineWidthPlugin,
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