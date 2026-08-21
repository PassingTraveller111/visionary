export type SourcePosition = {
  line: number;
  column: number;
};

export type SourceLocation = {
  file: string;
  start: SourcePosition;
  end?: SourcePosition;
  nodeId?: string;
  confidence?: number;
};

export type DomSourceMapper = {
  name: string;
  locate: (element: Element) => SourceLocation | null | Promise<SourceLocation | null>;
};
