import BoardView from './board-view.js';

class RushGamePegSolitaire extends HTMLElement {
  constructor() {
    console.log("Initializing Peg Solitaire component");
    super();
    this.attachShadow({ mode: 'open' });
    this.init();
  }

  async init() {
    try {
      const [html, css] = await Promise.all([
        fetch('./components/peg-solitaire/peg-solitaire.html').then((res) => res.text()),
        fetch('./components/peg-solitaire/peg-solitaire.css').then((res) => res.text()),
      ]);

      const template = document.createElement('template');
      template.innerHTML = `
          <style>${css}</style>
          ${html
          .replace('<template id="peg-solitaire-template">', '')
          .replace('</template>', '')
          .replace(/<style>.*?<\/style>/s, '')}
            `;
      const content = template.content.cloneNode(true);
      this.shadowRoot.appendChild(content);

      this.game = new BoardView(this.shadowRoot);
    } catch(err) {
      console.error('Error initializing Peg Solitaire:', err);
    }
  }
}

customElements.define('rushgame-peg-solitaire', RushGamePegSolitaire);
