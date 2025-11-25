class InputRow extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
  }
  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch('./components/comments/input-row/input-row.html').then((r) => r.text()),
      fetch('./components/comments/input-row/input-row.css').then((r) => r.text()),
    ]);
    this._root.innerHTML = `<style>${css}</style>${html}`;
    const $ = (r) => this._root.querySelector(`[data-ref="${r}"]`);
    this._ta = $('text');
    this._img = $('avatar');

    const avatar = this.getAttribute('avatar') || './assets/icons/avatar.svg';
    this._img.src = avatar;
    this._img.alt = 'avatar';
    this._img.addEventListener('error', () => {
      this._img.src = './assets/icons/avatar.svg';
    });

    const lineHeight = parseFloat(getComputedStyle(this._ta).lineHeight) || 18;
    const maxRows = parseInt(this.getAttribute('max-rows') || '4', 10);
    const maxH = lineHeight * maxRows;
    const grow = () => {
      this._ta.style.height = 'auto';
      const full = this._ta.scrollHeight,
        h = Math.min(full, maxH);
      this._ta.style.height = h + 'px';
      this._ta.style.overflowY = full > maxH ? 'auto' : 'hidden';
      this.dispatchEvent(
        new CustomEvent('input:changed', { detail: { text: this.value }, bubbles: true })
      );
    };
    this._ta.addEventListener('input', grow);
    queueMicrotask(grow);

    this.focusInput = () => this._ta.focus();
    Object.defineProperty(this, 'value', { get: () => this._ta.value });
    this.clear = () => {
      this._ta.value = '';
      grow();
    };
  }
}
customElements.define('input-row', InputRow);
