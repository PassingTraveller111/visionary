'use client'
import {Dropdown, DropdownProps, Tooltip} from "antd";
import {IconFont} from "@/components/IconFont";
import styles from './index.module.scss';
import classNames from "classnames";
import {ReactNode} from "react";

type PluginButtonProps = {
    disabled?: boolean,
    selected?: boolean,
    onClick?: () => void,
    title: string,
    iconName?: string,
    dropdownProps?: DropdownProps,
    content?: string | ReactNode
    needHoverBg?: boolean, // 是否需要hover背景色
}

const PluginButton = (props: PluginButtonProps) => {
    const {
        title,
        dropdownProps,
        iconName = '',
        disabled = false,
        content,
        selected = false,
        onClick,
        needHoverBg = true,
    } = props;
    return dropdownProps ?
       <Dropdown
            {...dropdownProps}
            disabled={disabled}
        >
               <Tooltip
                   title={<span>{title}</span>}
                   placement="top"
               >
                <span
                    className={classNames({
                        [styles.buttonContainer]: true,
                        [styles.disabled]: disabled,
                        [styles.selected]: selected,
                    })}
                    onClick={onClick}
                >
                    {content ? content : <IconFont type={iconName}/>}
                </span>
               </Tooltip>
        </Dropdown> :
            <Tooltip
                title={<span>{title}</span>}
                placement="top"
            >
                <span
                    className={classNames({
                        [styles.buttonContainer]: true,
                        [styles.disabled]: disabled,
                        [styles.selected]: selected,
                        [styles.needHoverBg]: needHoverBg,
                    })}
                    onClick={onClick}
                >
                    {content ? content : <IconFont type={iconName}/>}
                </span>
            </Tooltip>
}

export default PluginButton;