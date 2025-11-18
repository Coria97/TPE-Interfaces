class ReplyRow extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
  }
  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch('./components/comments/reply-row/reply-row.html').then((r) => r.text()),
      fetch('./components/comments/reply-row/reply-row.css').then((r) => r.text()),
    ]);
    this._root.innerHTML = `<style>${css}</style>${html}`;
    const $ = (r) => this._root.querySelector(`[data-ref="${r}"]`);

    const author = this.getAttribute('author') || '';
    const when = this.getAttribute('when') || '';
    const body = this.getAttribute('body') || '';
    const avatar = this.getAttribute('avatar') || './assets/icons/avatar.svg';

    $('author').textContent = author;
    $('when').textContent = when;
    $('body').textContent = body;

    const img = $('avatar');
    img.src = avatar;
    img.alt = author || 'avatar';
    img.addEventListener('error', () => {
      img.src = './assets/icons/avatar.svg';
    });
  }
}
customElements.define('reply-row', ReplyRow);
