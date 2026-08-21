export type DomPickerTarget = Element;

export type DomPickerOptions = {
  root?: Document | Element;
  exclude?: string | ((element: Element) => boolean);
  preventDefault?: boolean;
  onHover?: (element: DomPickerTarget | null) => void;
  onSelect?: (element: DomPickerTarget, event: MouseEvent) => void;
  onCancel?: () => void;
};

const HOST_ATTRIBUTE = 'data-dom-picker-overlay';

export class DomPicker {
  private readonly root: Document | Element;
  private readonly document: Document;
  private readonly options: DomPickerOptions;
  private host: HTMLDivElement | null = null;
  private box: HTMLDivElement | null = null;
  private label: HTMLDivElement | null = null;
  private target: Element | null = null;
  private previousCursor = '';
  private active = false;

  constructor(options: DomPickerOptions = {}) {
    const root = options.root ?? document;
    this.root = root;
    this.document = root instanceof Document ? root : root.ownerDocument;
    this.options = options;
  }

  get isActive() {
    return this.active;
  }

  get currentTarget() {
    return this.target;
  }

  start() {
    if (this.active) return;

    this.active = true;
    this.ensureOverlay();
    this.previousCursor = this.document.documentElement.style.cursor;
    this.document.documentElement.style.cursor = 'crosshair';
    this.document.addEventListener('pointermove', this.handlePointerMove, true);
    this.document.addEventListener('click', this.handleClick, true);
    this.document.addEventListener('keydown', this.handleKeyDown, true);
    this.document.addEventListener('scroll', this.handleViewportChange, true);
    this.document.defaultView?.addEventListener('resize', this.handleViewportChange);
  }

  stop() {
    if (!this.active) return;

    this.active = false;
    this.document.removeEventListener('pointermove', this.handlePointerMove, true);
    this.document.removeEventListener('click', this.handleClick, true);
    this.document.removeEventListener('keydown', this.handleKeyDown, true);
    this.document.removeEventListener('scroll', this.handleViewportChange, true);
    this.document.defaultView?.removeEventListener('resize', this.handleViewportChange);
    this.document.documentElement.style.cursor = this.previousCursor;

    this.setTarget(null);
  }

  destroy() {
    this.stop();
    this.host?.remove();
    this.host = null;
    this.box = null;
    this.label = null;
  }

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (!this.active) return;
    this.setTarget(this.findTarget(event));
  };

  private readonly handleClick = (event: MouseEvent) => {
    if (!this.active) return;

    const target = this.findTarget(event);
    if (!target) return;

    if (this.options.preventDefault !== false) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    this.stop();
    this.options.onSelect?.(target, event);
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (!this.active || event.key !== 'Escape') return;

    event.preventDefault();
    event.stopImmediatePropagation();
    this.stop();
    this.options.onCancel?.();
  };

  private readonly handleViewportChange = () => {
    if (!this.active || !this.target) return;
    this.renderOverlay(this.target);
  };

  private findTarget(event: Event): Element | null {
    const pathTarget = event.composedPath().find((node): node is Element => node instanceof Element);

    return pathTarget && this.canSelect(pathTarget) ? pathTarget : null;
  }

  private canSelect(element: Element) {
    if (element === this.host || element.closest(`[${HOST_ATTRIBUTE}]`)) return false;

    if (this.root instanceof Element && element !== this.root && !this.root.contains(element)) {
      return false;
    }

    if (typeof this.options.exclude === 'string' && element.closest(this.options.exclude)) {
      return false;
    }

    if (typeof this.options.exclude === 'function' && this.options.exclude(element)) {
      return false;
    }

    return true;
  }

  private setTarget(target: Element | null) {
    if (target === this.target) {
      if (target) this.renderOverlay(target);
      return;
    }

    this.target = target;
    this.options.onHover?.(target);

    if (target) {
      this.renderOverlay(target);
      return;
    }

    if (this.box) this.box.style.display = 'none';
  }

  private ensureOverlay() {
    if (this.host?.isConnected) return;

    const host = this.document.createElement('div');
    host.setAttribute(HOST_ATTRIBUTE, '');
    Object.assign(host.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      pointerEvents: 'none',
    });

    const shadowRoot = host.attachShadow({ mode: 'open' });
    const style = this.document.createElement('style');
    style.textContent = `
      :host {
        all: initial;
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        pointer-events: none;
      }
      .box {
        position: fixed;
        display: none;
        box-sizing: border-box;
        border: 2px solid #ff5c35;
        background: rgba(255, 92, 53, 0.12);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.85) inset;
        pointer-events: none;
        transition: left 45ms linear, top 45ms linear, width 45ms linear, height 45ms linear;
      }
      .label {
        position: absolute;
        left: -2px;
        bottom: calc(100% + 6px);
        max-width: min(420px, calc(100vw - 24px));
        padding: 5px 8px;
        border-radius: 5px;
        overflow: hidden;
        color: #fff;
        background: #171717;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.24);
        font: 600 12px/1.25 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .box.label-below .label {
        top: calc(100% + 6px);
        bottom: auto;
      }
    `;

    const box = this.document.createElement('div');
    box.className = 'box';
    const label = this.document.createElement('div');
    label.className = 'label';
    box.append(label);
    shadowRoot.append(style, box);
    this.document.body.append(host);

    this.host = host;
    this.box = box;
    this.label = label;
  }

  private renderOverlay(element: Element) {
    this.ensureOverlay();
    if (!this.box || !this.label) return;

    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      this.box.style.display = 'none';
      return;
    }

    const viewportWidth = this.document.documentElement.clientWidth;
    const left = Math.max(0, Math.min(rect.left, viewportWidth));
    const top = Math.max(0, rect.top);
    const width = Math.max(0, Math.min(rect.right, viewportWidth) - left);
    const height = Math.max(0, Math.min(rect.bottom, this.document.documentElement.clientHeight) - top);

    Object.assign(this.box.style, {
      display: 'block',
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });

    this.box.classList.toggle('label-below', top < 34);
    this.label.textContent = this.describeElement(element, rect);
  }

  private describeElement(element: Element, rect: DOMRect) {
    const id = element.id ? `#${element.id}` : '';
    const classes = Array.from(element.classList)
      .slice(0, 3)
      .map((className) => `.${className}`)
      .join('');
    const size = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    return `${element.tagName.toLowerCase()}${id}${classes}  ${size}`;
  }
}
