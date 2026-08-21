import type { DomSourceMapper, SourceLocation } from '../_lib/types';

type AstLocationResponse = SourceLocation & { error?: never };

export const astMapper: DomSourceMapper = {
  name: 'AST mapping',
  async locate(element) {
    const sourceElement = element.closest<HTMLElement>('[data-source-id]');
    const nodeId = sourceElement?.dataset.sourceId;
    if (!nodeId) return null;

    const query = new URLSearchParams({ id: nodeId });
    const response = await fetch(`/api/dom-source-lab/ast-location?${query}`);
    if (!response.ok) return null;

    return response.json() as Promise<AstLocationResponse>;
  },
};
