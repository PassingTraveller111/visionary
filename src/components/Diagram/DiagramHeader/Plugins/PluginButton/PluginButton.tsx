'use client'
import {Dropdown, DropdownProps, Tooltip} from "antd";
import {IconFont} from "@/components/IconFont";
import styles from './index.module.scss';
import classNames from "classnames";

const PluginButton = (props: { disabled?: boolean, title: string, iconName: string, dropdownProps: DropdownProps }) => {
    const { title, dropdownProps, iconName, disabled = false } = props;
    return   <Dropdown
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
                <IconFont type={iconName}/>
            </span>
        </Tooltip>
    </Dropdown>
}

export default PluginButton;