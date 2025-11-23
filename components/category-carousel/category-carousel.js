class RushGameCategoryCarousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.carouselData = {
      title: 'Categorías más populares',
      categories: [],
    };

    this.init();
  }

  async init() {
    try {
      const [html, css] = await Promise.all([
        fetch('./components/category-carousel/category-carousel.html').then((res) => res.text()),
        fetch('./components/category-carousel/category-carousel.css').then((res) => res.text()),
      ]);

      const template = document.createElement('template');
      template.innerHTML = `
                <style>${css}</style>
                ${html
                  .replace('<template id="category-carousel-template">', '')
                  .replace('</template>', '')
                  .replace(/<style>.*?<\/style>/s, '')}
            `;

      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      this.setupElements();
      this.updateDisplay();
    } catch (error) {
      console.error('Error loading RushCategoryCarousel component:', error);
    }
  }

  setupElements() {
    this.carouselTitle = this.shadowRoot.querySelector('#carouselTitle');
    this.categoriesContainer = this.shadowRoot.querySelector('.categories-container');
  }

  updateDisplay() {
    if (!this.categoriesContainer) return;

    if (this.carouselTitle) {
      this.carouselTitle.textContent = this.carouselData.title;
    }

    this.categoriesContainer.innerHTML = '';

    this.carouselData.categories.forEach((category) => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card';

      categoryCard.innerHTML = `
                <div class="category-icon">${category.icon}</div>
                <h3 class="category-name">${category.name}</h3>
            `;

      categoryCard.addEventListener('click', () => {
        this.handleCategoryClick(category);
      });

      this.categoriesContainer.appendChild(categoryCard);
    });
  }

  handleCategoryClick(category) {
    this.dispatchEvent(
      new CustomEvent('categorySelected', {
        detail: {
          id: category.id,
          name: category.name,
        },
        bubbles: true,
      })
    );
  }

  setCategories(categories) {
    this.carouselData.categories = categories;
    this.updateDisplay();
  }

  setTitle(title) {
    this.carouselData.title = title;
    if (this.carouselTitle) {
      this.carouselTitle.textContent = title;
    }
  }

  static get observedAttributes() {
    return ['title', 'categories'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'title':
        this.carouselData.title = newValue || 'Categorías más populares';
        if (this.carouselTitle) {
          this.carouselTitle.textContent = this.carouselData.title;
        }
        break;
      case 'categories':
        try {
          this.carouselData.categories = JSON.parse(newValue) || [];
          this.updateDisplay();
        } catch (e) {
          console.error('Error parsing categories:', e);
        }
        break;
    }
  }

  connectedCallback() {
    console.log('RushCategoryCarousel connected to DOM');
  }

  disconnectedCallback() {
    console.log('RushCategoryCarousel disconnected from DOM');
  }
}
setTimeout(() => {
  // Configurar categorías
  const categories = [
    { id: 'accion', name: 'Acción', icon: '⚔️' },
    { id: 'carreras', name: 'Carreras', icon: '🏎️' },
    { id: 'puzzle', name: 'Puzzle', icon: '🧩' },
    { id: 'deportes', name: 'Deportes', icon: '⚽' },
    { id: 'estrategia', name: 'Estrategia', icon: '🎯' },
    { id: 'aventura', name: 'Aventura', icon: '🗺️' },
    { id: 'casual', name: 'Casual', icon: '🎲' },
    { id: 'arcade', name: 'Arcade', icon: '🕹️' },
  ];

  const categoryCarousel = document.getElementById('categoryCarousel');
  categoryCarousel.setTitle('Categorías más populares');
  categoryCarousel.setCategories(categories);

  // Escuchar clicks en categorías
  categoryCarousel.addEventListener('categorySelected', (e) => {
    console.log('Categoría seleccionada:', e.detail);
    // Aquí puedes filtrar juegos, navegar a otra página, etc.
  });
}, 100);

customElements.define('rushgame-category-carousel', RushGameCategoryCarousel);
