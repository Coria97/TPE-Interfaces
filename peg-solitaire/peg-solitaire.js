class RushGamePegSolitaire extends HTMLElement {
  constructor() {
    super();
    
    this.attachShadow({ mode: 'open' });

    this.init();

    

  }

  async init() {
    Promise.all([
      fetch('./components/peg-solitaire/peg-solitaire.html').then((res) => res.text()),
      fetch('./components/peg-solitaire/peg-solitaire.css').then((res) => res.text()),
    ]).then(([html, css]) => {
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

    });

    const gameModule = await import('./board.js');
    this.game = Board(this.shadowRoot)
  }
}

customElements.define('rushgame-peg-solitaire', RushGamePegSolitaire);
