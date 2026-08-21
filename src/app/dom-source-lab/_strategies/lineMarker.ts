import type { DomSourceMapper, SourceLocation } from '../_lib/types';

const SOURCE_SELECTOR = '[data-source-file][data-source-line]';

export const lineMarkerMapper: DomSourceMapper = {
  name: 'Line marker',
  locate(element) {
    const sourceElement = element.closest<HTMLElement>(SOURCE_SELECTOR);
    if (!sourceElement) return null;

    const line = Number(sourceElement.dataset.sourceLine);
    const column = Number(sourceElement.dataset.sourceColumn ?? 1);
    if (!sourceElement.dataset.sourceFile || !Number.isInteger(line) || line < 1) {
      return null;
    }

    const location: SourceLocation = {
      file: sourceElement.dataset.sourceFile,
      start: {
        line,
        column: Number.isInteger(column) && column > 0 ? column : 1,
      },
      nodeId: sourceElement.dataset.sourceId,
      confidence: 1,
    };

    return location;
  },
};
