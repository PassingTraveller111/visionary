import {ClassAttributes, ElementType, HTMLAttributes} from "react";
import {ExtraProps} from "react-markdown";


export type ComponentType = ElementType<ClassAttributes<HTMLElement> & HTMLAttributes<HTMLElement> & ExtraProps> | undefined;