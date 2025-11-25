// components/share-modal/share-modal.js
class ShareModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.$ = (s) => this.shadowRoot.querySelector(s);
    this._mounted = false;
    this._isOpen = false;
  }

  async connectedCallback() {
    if (this._mounted) return;

    const base = new URL('.', import.meta.url);
    const htmlURL = new URL('share-modal.html', base);
    const cssURL = new URL('share-modal.css', base);

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
    const tpl = doc.getElementById('share-modal-template');
    this.shadowRoot.append(tpl.content.cloneNode(true));

    // Load social icons
    await this.#loadSocialIcons();

    this._mounted = true;
    this.#setupEventListeners();
  }

  async #loadSocialIcons() {
    try {
      const SOCIAL_BASE = new URL('./assets/icons/social/', import.meta.url);
      const platforms = ['email', 'facebook', 'instagram', 'twitter', 'whatsapp'];

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

  #setupEventListeners() {
    // Close button
    this.$('.share-modal__close-btn')?.addEventListener('click', () => {
      this.close();
    });

    // Overlay click to close
    this.$('.share-modal-overlay')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.close();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isOpen) {
        this.close();
      }
    });

    // Copy button
    this.$('.share-modal__copy-btn')?.addEventListener('click', () => {
      this.#copyToClipboard();
    });

    // Social platform buttons
    this.shadowRoot.querySelectorAll('.share-modal__social-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const platform = btn.dataset.platform;
        this.#shareToPlatform(platform);
      });
    });
  }

  open() {
    if (!this._mounted) return;

    this._isOpen = true;
    this.$('.share-modal-overlay').setAttribute('data-open', 'true');
    document.body.style.overflow = 'hidden';

    // Focus management
    this.$('.share-modal__close-btn')?.focus();
  }

  close() {
    if (!this._mounted) return;

    this._isOpen = false;
    this.$('.share-modal-overlay').setAttribute('data-open', 'false');
    document.body.style.overflow = '';
  }

  #copyToClipboard() {
    const input = this.$('.share-modal__link-input');
    if (input) {
      input.select();
      input.setSelectionRange(0, 99999); // For mobile devices

      try {
        document.execCommand('copy');
        this.#showCopyFeedback();
      } catch (err) {
        console.warn('No se pudo copiar al portapapeles:', err);
      }
    }
  }

  #showCopyFeedback() {
    const copyBtn = this.$('.share-modal__copy-btn');
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '¡Copiado!';
      copyBtn.style.background = '#10c27c';

      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '#9ef84a';
      }, 2000);
    }
  }

  #shareToPlatform(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);

    let shareUrl = '';

    switch (platform) {
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct sharing, show message
        this.#showInstagramMessage();
        return;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${title}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  #showInstagramMessage() {
    const copyBtn = this.$('.share-modal__copy-btn');
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copia el enlace';
      copyBtn.style.background = '#f59e0b';

      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '#9ef84a';
      }, 3000);
    }
  }
}

customElements.define('share-modal', ShareModal);
