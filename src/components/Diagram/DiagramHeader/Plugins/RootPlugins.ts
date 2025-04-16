import TextAlignPlugin from "@/components/Diagram/DiagramHeader/Plugins/TextAlignPlugin";
import {configType} from "@/components/Diagram/DiagramHeader/Plugins/type";
import LineTypePlugin from "@/components/Diagram/DiagramHeader/Plugins/LineTypePlugin";


const rootPlugins = [
    TextAlignPlugin,
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