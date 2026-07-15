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
    | 'taskList'
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

export type MdEditorV2Props = {
    value: string;
    onChange: (value: string) => void;
    onSaveDraft: (value?: string) => void;
    saveStatus?: 'loading' | 'success' | 'error';
    lastSavedAt?: Date | null;
    hasUnsavedChanges?: boolean;
    onRetrySave?: () => void;
    className?: string;
};

export type FindMatch = SelectionRange;

export type ImageTarget = {
    range: SelectionRange;
    url: string;
    alt: string;
    width: string;
};

export type HighlightRange = SelectionRange & {
    className: string;
};
