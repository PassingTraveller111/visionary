


export type configType = {
    name: string;
    align?: 'left' | 'right';
}

export type PluginType = {
    (): JSX. Element;
    config: configType
}