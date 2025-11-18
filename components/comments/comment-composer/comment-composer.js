class CommentComposer extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch('./components/comments/comment-composer/comment-composer.html').then((r) => r.text()),
      fetch('./components/comments/comment-composer/comment-composer.css').then((r) => r.text()),
    ]);
    this._root.innerHTML = `<style>${css}</style>${html}`;

    const $ = (ref) => this._root.querySelector(`[data-ref="${ref}"]`);
    const ta = $('text');
    const send = $('send');
    const cancel = $('cancel');
    const img = $('avatar');

    // avatar (se puede sobreescribir con atributo)
    const avatar = this.getAttribute('avatar') || './assets/icons/avatar.svg';
    img.src = avatar;
    img.alt = 'avatar';
    img.addEventListener('error', () => {
      img.src = './assets/icons/avatar.svg';
    });

    const lineHeight = parseFloat(getComputedStyle(ta).lineHeight) || 20;
    const maxRows = parseInt(this.getAttribute('max-rows') || '8', 10);
    const maxHeight = lineHeight * maxRows;

    const updateTextarea = () => {
      // habilitar / deshabilitar botón
      send.disabled = ta.value.trim().length === 0;

      // autogrow
      ta.style.height = 'auto';
      const full = ta.scrollHeight;
      const newH = Math.min(full, maxHeight);
      ta.style.height = newH + 'px';

      // si pasamos de ~1.5 líneas, quitamos "píldora"
      const multi = newH > lineHeight * 1.5;
      ta.classList.toggle('multiline', multi);

      // si excede el máximo, permitimos scroll vertical
      ta.style.overflowY = full > maxHeight ? 'auto' : 'hidden';
    };

    ta.addEventListener('input', updateTextarea);
    queueMicrotask(updateTextarea); // ejecuta una vez al montar

    // emitir eventos
    send.addEventListener('click', () => {
      const text = ta.value.trim();
      if (!text) return;
      this.dispatchEvent(new CustomEvent('comment:submit', { detail: { text }, bubbles: true }));
      this.reset();
    });
    cancel.addEventListener('click', () => {
      text.value = '';
      // si tenés un auto-resize, asegurate de recalcular altura:
      autoResize();
      // deshabilitar el botón "Comentar"
      send.disabled = true;
      // (opcional) blur para cerrar el “estado activo”
      text.blur();
    });

    // API pública
    this.reset = () => {
      // limpiar valor y desactivar botón
      ta.value = '';
      send.disabled = true;

      // volver al estado de 1 línea
      ta.classList.remove('multiline');
      ta.style.overflowY = 'hidden';
      ta.style.height = ''; // quita inline height
      ta.setAttribute('rows', '1'); // fuerza altura mínima

      // recalcula en el próximo frame
      requestAnimationFrame(updateTextarea);
    };
    this.focusInput = () => ta.focus();
  }
}
customElements.define('comment-composer', CommentComposer);
