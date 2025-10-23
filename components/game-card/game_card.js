class RushGameCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    // Game data
    this.gameData = {
      id: '',
      title: 'Título del Juego',
      image: '',
      rating: 0,
    };

    // Responsive handling
    this.resizeObserver = null;

    this.init();
  }

  async init() {
    try {
      const [html, css] = await Promise.all([
        fetch('./components/game-card/game_card.html').then((res) => res.text()),
        fetch('./components/game-card/game_card.css').then((res) => res.text()),
      ]);

      const template = document.createElement('template');
      template.innerHTML = `
                <style>${css}</style>
                ${html
                  .replace('<template id="game-card-template">', '')
                  .replace('</template>', '')
                  .replace(/<style>.*?<\/style>/s, '')}
            `;

      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      this.setupElements();
      this.setupEventListeners();
      this.setupResizeObserver();
      this.updateDisplay();
    } catch (error) {
      console.error('Error loading RushGameCard component:', error);
      this.renderErrorState();
    }
  }

  setupElements() {
    this.card = this.shadowRoot.querySelector('.game-card');
    this.gameImage = this.shadowRoot.querySelector('#gameImage');
    this.gameTitle = this.shadowRoot.querySelector('#gameTitle');
    this.gameRating = this.shadowRoot.querySelector('#gameRating');
    this.stars = this.shadowRoot.querySelectorAll('.star');
    this.playBtn = this.shadowRoot.querySelector('#playBtn');
  }

  setupEventListeners() {
    this.card.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      this.handlePlayClick();
    });

    if (this.playBtn) {
      this.playBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handlePlayClick();
      });
    }
  }

  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this);
    }
  }

  handleResize() {
    // Add responsive behavior if needed
    const width = this.offsetWidth;

    // Adjust title truncation based on available width
    if (width < 180) {
      this.updateTitleTruncation(8);
    } else if (width < 200) {
      this.updateTitleTruncation(10);
    } else {
      this.updateTitleTruncation(12);
    }
  }

  updateTitleTruncation(maxLength) {
    if (!this.gameTitle) return;

    let title = this.gameData.title;
    if (title.length > maxLength) {
      title = title.slice(0, maxLength - 3) + '...';
    }
    this.gameTitle.textContent = title;
    this.gameTitle.setAttribute('title', this.gameData.title);
  }

  updateDisplay() {
    /* Update title, image, rating, and buttons based on gameData */

    if (!this.gameTitle) return;

    // Use responsive title truncation
    this.handleResize();

    // Update image
    if (this.gameData.image) {
      this.gameImage.src = this.gameData.image;
      this.gameImage.alt = `Imagen de ${this.gameData.title}`;
    }

    // Update rating stars
    this.updateRating(this.gameData.rating);
  }

  updateRating(rating) {
    /* Update star display based on rating */

    if (!this.stars) return;

    // Clamp rating between 0 and 5
    const clampedRating = Math.max(0, Math.min(5, rating));

    this.stars.forEach((star, index) => {
      star.classList.remove('filled', 'half-filled');
      if (index < Math.floor(clampedRating)) {
        star.classList.add('filled');
      } else if (index < clampedRating && clampedRating % 1 !== 0) {
        star.classList.add('half-filled');
      }
    });
  }

  handlePlayClick() {
    // if the card is inside an <a> tag, follow that link (but avoid following a generic game.html without params)
    const outerLink = this.closest('a');
    if (outerLink && outerLink.href && !outerLink.href.includes('game.html')) {
      window.location.href = outerLink.href;
      return;
    }

    // Prefer explicit attribute, then internal data, then fallback to gameData
    let id = this.getAttribute('game-id') || this.dataset.game || this.dataset.gameId || this.gameData.id || '';

    // If still empty, try to derive a slug from the title and map to known keys (heuristic)
    if (!id && this.gameData && this.gameData.title) {
      const slug = this.gameData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const known = ['peg-solitaire', 'blocka'];
      if (known.includes(slug)) id = slug;
    }

    if (!id) {
      console.warn('RushGameCard: no game-id found on card. Expected attribute game-id="blocka" or similar.');
      // keep current behavior but be explicit
      window.location.href = 'game.html';
      return;
    }

    const target = `game.html?game=${encodeURIComponent(id)}`;
    window.location.href = target;
  }

  rotateLeft() {
    // Ensure component is fully initialized
    if (!this.card || !this.shadowRoot) return;

    // Remove any existing animations
    this.card.style.animation = '';
    this.card.classList.remove('rotating-left', 'rotating-right');

    // Force a reflow to ensure the removal takes effect
    this.card.offsetHeight;

    // Apply animation directly via style
    let animationName = 'simpleRotateLeft';
    let duration = '0.8s';

    // Adjust for mobile
    if (window.innerWidth <= 480) {
      duration = '0.3s';
    } else if (window.innerWidth <= 768) {
      duration = '0.5s';
    }

    this.card.style.animation = `${animationName} ${duration} ease-in-out`;

    // Remove animation after completion
    setTimeout(
      () => {
        if (this.card) {
          this.card.style.animation = '';
        }
      },
      parseFloat(duration) * 1000
    );
  }

  rotateRight() {
    // Ensure component is fully initialized
    if (!this.card || !this.shadowRoot) return;

    // Remove any existing animations
    this.card.style.animation = '';
    this.card.classList.remove('rotating-left', 'rotating-right');

    // Force a reflow to ensure the removal takes effect
    this.card.offsetHeight;

    // Apply animation directly via style
    let animationName = 'simpleRotateRight';
    let duration = '0.8s';

    // Adjust for mobile
    if (window.innerWidth <= 480) {
      duration = '0.3s';
    } else if (window.innerWidth <= 768) {
      duration = '0.5s';
    }

    this.card.style.animation = `${animationName} ${duration} ease-in-out`;

    // Remove animation after completion
    setTimeout(
      () => {
        if (this.card) {
          this.card.style.animation = '';
        }
      },
      parseFloat(duration) * 1000
    );
  }

  connectedCallback() {
    this.setAttribute('tabindex', '0');
  }

  disconnectedCallback() {
    // Clean up resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  static get observedAttributes() {
    return ['game-id', 'title', 'image', 'rating'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'game-id':
        this.gameData.id = newValue || '';
        break;
      case 'title':
        this.gameData.title = newValue || 'Título del Juego';
        break;
      case 'image':
        this.gameData.image = newValue || '';
        break;
      case 'rating':
        this.gameData.rating = parseFloat(newValue) || 0;
        break;
    }
    this.updateDisplay();
  }
}

customElements.define('rushgame-card', RushGameCard);
