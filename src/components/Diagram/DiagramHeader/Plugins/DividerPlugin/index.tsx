
import { PluginType } from "@/components/Diagram/DiagramHeader/Plugins/type";
import {Divider} from "antd";



const DividerPlugin: PluginType = () => {
    return (
        <Divider type={'vertical'} />
    );
};

DividerPlugin.config = {
    name: "DividerPlugin",
    align: "left",
};

export default DividerPlugin;

