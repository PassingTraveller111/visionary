import imagePlugin from "@/components/MdEditor/plugins/ImagePlugin";
import TitlePlugin from "@/components/MdEditor/plugins/TitlePlugin";
import BoldPlugin from "@/components/MdEditor/plugins/BoldPlugin";
import ItalicPlugin from "@/components/MdEditor/plugins/ItalicPugin";
import DelPlugin from "@/components/MdEditor/plugins/DelPlugin";


const rootPluginsList = [
    TitlePlugin,
    BoldPlugin,
    ItalicPlugin,
    DelPlugin,
    imagePlugin,
];

export default rootPluginsList;