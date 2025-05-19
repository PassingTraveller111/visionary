'use client'
import {Dropdown, DropdownProps, Tooltip} from "antd";
import {IconFont} from "@/components/IconFont";
import styles from './index.module.scss';
import classNames from "classnames";
import {ReactNode} from "react";

const PluginButton = (props: { disabled?: boolean, title: string, iconName?: string, dropdownProps?: DropdownProps, content?: string | ReactNode }) => {
    const { title, dropdownProps, iconName = '', disabled = false, content } = props;
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
                })}
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
                })}
            >
                {content ? content : <IconFont type={iconName}/>}
            </span>
        </Tooltip>
}

export default PluginButton;