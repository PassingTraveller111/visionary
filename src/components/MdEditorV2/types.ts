export type EditorMode = 'split' | 'edit' | 'preview';

export type EditorCommand =
    | 'h1'
    | 'h2'
    | 'h3'
    | 'bold'
    | 'italic'
    | 'delete'
    | 'ul'
    | 'ol'
    | 'quote'
    | 'divider'
    | 'link'
    | 'inlineCode'
    | 'blockCode'
    | 'table'
    | 'formula'
    | 'save';

export type SelectionRange = {
    start: number;
    end: number;
};

export type TextEditResult = {
    value: string;
    selection: SelectionRange;
};
