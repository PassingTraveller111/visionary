import {ComponentType} from "@/components/ReactMarkdown/components/type";
import { useMemo } from "react";
import CodeComponents from "@/components/ReactMarkdown/components/CodeBlock";
import DiagramComponents from "@/components/ReactMarkdown/components/Diagram";

const PreParseComponents: ComponentType  = (props) => {
    const { children } = props
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const match = /language-(\w+)/.exec(children && children.props.className || "");
    const languageLabel = match ? match[1] : '';
    const ParseComponent = useMemo(() => {
        if(languageLabel === 'diagram'){
            return DiagramComponents
        }
        return CodeComponents
    },[languageLabel])
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return <ParseComponent {...props} />
}

export default PreParseComponents;