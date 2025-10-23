// components/game-description/game-description.js
class GameDescription extends HTMLElement {
  static get observedAttributes() {
    return [
      'title',
      'poster',
      'rating',
      'release-date',
      'clamp',
      'facebook',
      'x',
      'instagram',
      'tiktok',
      'youtube',
      'facebook-text',
      'x-text',
      'instagram-text',
      'tiktok-text',
      'youtube-text'
    ];
  }
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.$ = (s) => this.shadowRoot.querySelector(s);
    this._mounted = false;
  }

  async connectedCallback() {
    if (this._mounted) return;

    const base = new URL('.', import.meta.url);
    const htmlURL = new URL('game-description.html', base);
    const cssURL = new URL('game-description.css', base);

    // CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssURL.href;
    this.shadowRoot.append(link);

    // Template
    const tplText = await fetch(htmlURL.href).then((r) => {
      if (!r.ok) throw new Error(`No pude cargar ${htmlURL.pathname}`);
      return r.text();
    });
    const doc = new DOMParser().parseFromString(tplText, 'text/html');
    const tpl = doc.getElementById('game-description-template');
    this.shadowRoot.append(tpl.content.cloneNode(true));

    const clamp = this.getAttribute('clamp');
    if (clamp) this.shadowRoot.host.style.setProperty('--clamp-lines', clamp);

    // === Icon masks: share + star ===
    try {
      const UI_BASE = new URL('../../assets/icons/ui/', import.meta.url);
      const shareURL = new URL('share.svg', UI_BASE).href;
      const starURL = new URL('star.svg', UI_BASE).href;
      const ico = this.$('.gd__share-ico');
      ico?.style.setProperty('--share-mask', `url("${shareURL}")`);
      // expose star mask for CSS
      this.shadowRoot.host.style.setProperty('--star-mask', `url("${starURL}")`);

      // Si el navegador NO soporta mask-image → fallback
      if (!CSS.supports('mask-image', 'url(#)')) this.shadowRoot.host.classList.add('no-mask');
    } catch {
      this.shadowRoot.host.classList.add('no-mask');
    }

    // === Load social icons ===
    this.#loadSocialIcons();

    this._mounted = true;
    this.#render();

    // Inicializar links de redes según atributos actuales
    this.#initSocials();

    // Toggle buttons
    this.$('.gd__toggle-expanded')?.addEventListener('click', () => {
      this.toggleAttribute('expanded');
    });

    // Click en el texto "...mas" para expandir
    this.$('.gd__desc-text')?.addEventListener('click', (e) => {
      if (!this.hasAttribute('expanded')) {
        this.toggleAttribute('expanded');
      }
    });

    // Share button - open modal
    this.$('.gd__share')?.addEventListener('click', () => {
      this.#openShareModal();
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!this._mounted) return;
    if (oldValue === newValue) return;

    // cambios en urls/plataformas
    if (['facebook', 'x', 'instagram', 'tiktok', 'youtube'].includes(name)) {
      this.#applySocial(name);
      return;
    }

    // cambios en los textos de las redes (e.g. 'facebook-text')
    if (name.endsWith('-text')) {
      const platform = name.split('-')[0];
      this.#applySocial(platform);
      return;
    }

    // Para otros atributos re-render completo (title, poster, rating, release-date, clamp)
    if (['title', 'poster', 'rating', 'release-date', 'clamp'].includes(name)) {
      this.#render();
    }
  }

  #openShareModal() {
    // Create or get existing modal
    let modal = document.querySelector('share-modal');
    if (!modal) {
      modal = document.createElement('share-modal');
      document.body.appendChild(modal);
    }

    // Update modal with current page info
    const linkInput = modal.shadowRoot.querySelector('.share-modal__link-input');
    if (linkInput) {
      linkInput.value = window.location.href;
    }

    // Open modal
    modal.open();
  }

  async #loadSocialIcons() {
    try {
      const SOCIAL_BASE = new URL('../../assets/icons/social/', import.meta.url);
      const platforms = ['facebook', 'x', 'instagram', 'tiktok', 'youtube'];

      for (const platform of platforms) {
        const iconURL = new URL(`${platform}.svg`, SOCIAL_BASE).href;
        const iconEl = this.$(`[data-icon="${platform}"]`);
        if (iconEl) {
          iconEl.style.setProperty('--social-icon-mask', `url("${iconURL}")`);
        }
      }
    } catch (error) {
      console.warn('No se pudieron cargar los iconos sociales:', error);
    }
  }

  #initSocials() {
    const platforms = ['facebook', 'x', 'instagram', 'tiktok', 'youtube'];
    for (const p of platforms) {
      // #applySocial leerá tanto la URL (atributo 'p') como el texto (atributo `${p}-text`)
      this.#applySocial(p);
    }
  }

  #applySocial(platform, value) {
    const anchor = this.$(`.gd__social-link[data-platform="${platform}"]`);
    if (!anchor) return;

    const url = this.getAttribute(platform);
    const textAttr = this.getAttribute(`${platform}-text`);
    const textEl = anchor.querySelector('.gd__social-text');

    if (!url) {
      // ocultar si no hay URL
      anchor.style.display = 'none';
      return;
    }

    anchor.href = url;
    anchor.style.display = '';

    // actualizar texto visible: si viene atributo `${platform}-text` usarlo,
    // si no, intentar derivar algo del URL (host/path) o dejar el texto que ya tenía la plantilla.
    if (textEl) {
      if (textAttr) {
        textEl.textContent = textAttr;
      } else {
        try {
          const u = new URL(url);
          // mostrar el handle/path o el hostname como fallback
          const path = u.pathname.replace(/^\/+/, '');
          textEl.textContent = path ? (path.startsWith('@') ? path : path.split('/').pop()) : u.hostname;
        } catch {
          // no es una URL válida: dejar texto actual
        }
      }
    }
  }

  #render() {
    // Título
    const elTitle = this.$('.gd__title');
    if (elTitle) elTitle.textContent = this.getAttribute('title') || 'Título del juego';

    // Póster (con fallback si hay 404/typo)
    const img = this.$('.gd__poster img');
    if (img) {
      const p = this.getAttribute('poster');
      img.src = p ? p : new URL('../../assets/placeholders/poster.webp', import.meta.url).href;
    }

    // Rating as fractional stars (0..5)
    const rating = Number(this.getAttribute('rating') || 0);
    const clamped = Math.max(0, Math.min(5, rating));
    const percent = (clamped / 5) * 100;
    const starsEl = this.$('.gd__stars');
    if (starsEl) {
      starsEl.setAttribute('aria-label', `${clamped.toFixed(1)} de 5 estrellas`);
      this.shadowRoot.host.style.setProperty('--stars-fill', `${percent}%`);
    }
    const val = this.$('.gd__value');
    if (val) val.textContent = rating ? rating.toFixed(1) : '0.0';

    // Fecha
    const d = this.getAttribute('release-date') || '';
    const t = this.$('.gd__date');
    if (t) {
      t.textContent = d;
      t.dateTime = d;
    }

    // Clamp (si cambia por atributo)
    const clamp = this.getAttribute('clamp');
    if (clamp) this.shadowRoot.host.style.setProperty('--clamp-lines', clamp);
  }
}
customElements.define('game-description', GameDescription);
