import imagePlugin from "@/components/MdEditor/plugins/ImagePlugin";
import TitlePlugin from "@/components/MdEditor/plugins/TitlePlugin";
import BoldPlugin from "@/components/MdEditor/plugins/BoldPlugin";
import ItalicPlugin from "@/components/MdEditor/plugins/ItalicPugin";
import DelPlugin from "@/components/MdEditor/plugins/DelPlugin";
import OlPlugin from "@/components/MdEditor/plugins/OlPlugin";
import UlPlugin from "@/components/MdEditor/plugins/UlPlugin";
import QuotePlugin from "@/components/MdEditor/plugins/QuotePlugin";
import DividerPlugin from "@/components/MdEditor/plugins/Divider";
import LinkPlugin from "@/components/MdEditor/plugins/LinkPlugin";
import LineCodePlugin from "@/components/MdEditor/plugins/LineCodePlugin";
import BlockCodePlugin from "@/components/MdEditor/plugins/BlockCodePlugin";
import FormulaPlugin from "@/components/MdEditor/plugins/FormulaPlugin";
import TablePlugin from "@/components/MdEditor/plugins/TablePlugin";
import ModeChangePlugin from "@/components/MdEditor/plugins/ModeChangePlugin";
import FullScreenPlugin from "@/components/MdEditor/plugins/FullScreen";
import TabInsertPlugin from "@/components/MdEditor/plugins/TabInsertPlugin";
import FindPlugin from "@/components/MdEditor/plugins/FindPlugin";
import imageScalePlugin from "@/components/MdEditor/plugins/ImageScalePlugin";


const rootPluginsList = [
    TitlePlugin,
    BoldPlugin,
    ItalicPlugin,
    DelPlugin,
    UlPlugin,
    OlPlugin,
    LinkPlugin,
    QuotePlugin,
    DividerPlugin,
    LineCodePlugin,
    BlockCodePlugin,
    FormulaPlugin,
    TablePlugin,
    imagePlugin,
    imageScalePlugin,
    ModeChangePlugin,
    FullScreenPlugin,
    TabInsertPlugin,
    FindPlugin,
];

export default rootPluginsList;