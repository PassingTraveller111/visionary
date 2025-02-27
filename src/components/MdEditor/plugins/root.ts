import imagePlugin from "@/components/MdEditor/plugins/ImagePlugin";
import TitlePlugin from "@/components/MdEditor/plugins/TitlePlugin";
import BoldPlugin from "@/components/MdEditor/plugins/BoldPlugin";
import ItalicPlugin from "@/components/MdEditor/plugins/ItalicPugin";
import DelPlugin from "@/components/MdEditor/plugins/DelPlugin";
import OlPlugin from "@/components/MdEditor/plugins/OlPlugin";
import UlPlugin from "@/components/MdEditor/plugins/UlPlugin";
import QuotePlugin from "@/components/MdEditor/plugins/QuotePlugin";
import DividerPlugin from "@/components/MdEditor/plugins/Divider";


const rootPluginsList = [
    TitlePlugin,
    BoldPlugin,
    ItalicPlugin,
    DelPlugin,
    UlPlugin,
    OlPlugin,
    QuotePlugin,
    DividerPlugin,
    imagePlugin,
];

export default rootPluginsList;