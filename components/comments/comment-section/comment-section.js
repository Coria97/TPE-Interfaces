// components/comments/comment-section/comment-section.js
class CommentSection extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    const [html, css] = await Promise.all([
      fetch('./components/comments/comment-section/comment-section.html').then((r) => r.text()),
      fetch('./components/comments/comment-section/comment-section.css').then((r) => r.text()),
    ]);
    this._root.innerHTML = `<style>${css}</style>${html}`;

    const root = this._root;
    const list = root.getElementById('list');
    const composer = root.querySelector('comment-composer');
    const counter = root.getElementById('count');

    // Estado
    const comments = [
      {
        id: '1',
        author: 'mxr_',
        when: 'hoy 16:42',
        body: 'Texto del comentario…',
        avatar: './assets/icons/avatar.svg',
        replies: [],
      },
      {
        id: '2',
        author: 'ana',
        when: 'ayer',
        body: 'Otro comentario…',
        avatar: './assets/icons/avatar.svg',
        replies: [],
      },
    ];

    const openIds = new Set(); // hilos abiertos por el usuario (persisten entre renders)
    let pendingOpenId = null;

    const render = () => {
      list.innerHTML = '';
      const frag = document.createDocumentFragment();

      for (const c of comments) {
        const li = document.createElement('li');
        li.dataset.id = c.id;

        const item = document.createElement('comment-item');
        item.setAttribute('author', c.author);
        item.setAttribute('when', c.when);
        item.setAttribute('body', c.body);
        if (c.avatar) item.setAttribute('avatar', c.avatar);

        // ⬇️ alta de reply
        item.addEventListener('reply:add', (ev) => {
          const { text } = ev.detail;
          if (!text?.trim()) return;

          c.replies ||= [];
          c.replies.push({
            id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
            author: 'vos',
            when: 'ahora',
            body: text,
            avatar: './assets/icons/avatar.svg',
          });

          pendingOpenId = c.id; // ✅ mantener este abierto
          render();
        });

        item.addEventListener('thread:open', () => openIds.add(c.id));
        item.addEventListener('thread:close', () => openIds.delete(c.id));

        li.appendChild(item);
        frag.appendChild(li);
      }

      list.appendChild(frag);
      for (const c of comments) {
        const el = list.querySelector(`li[data-id="${c.id}"] comment-item`);
        const replies = c.replies || [];
        customElements
          .whenDefined('comment-item')
          .then(() => el?.ready) // usamos la promesa `ready` del item
          .then(() => el?.setReplies(replies));
      }

      // reabrir hilos que el usuario tenía abiertos
      for (const id of openIds) {
        const el = list.querySelector(`li[data-id="${id}"] comment-item`);
        const replies = comments.find((x) => x.id === id)?.replies || [];
        customElements
          .whenDefined('comment-item')
          .then(() => el?.ready)
          .then(() => {
            el?.openThread();
            el?.setReplies(replies);
          });
      }

      // reabrir (solo una vez) el coment al que se respondió recién
      if (pendingOpenId) {
        const id = pendingOpenId;
        pendingOpenId = null; // one-shot
        openIds.add(id); // que quede abierto también a futuro
        const el = list.querySelector(`li[data-id="${id}"] comment-item`);
        const replies = comments.find((x) => x.id === id)?.replies || [];
        customElements
          .whenDefined('comment-item')
          .then(() => el?.ready)
          .then(() => {
            el?.openThread();
            el?.setReplies(replies);
          });
      }

      if (counter) counter.textContent = String(comments.length);
    };

    // ⬅️ alta de comentario nuevo (top-level)
    composer?.addEventListener('comment:submit', (ev) => {
      const { text } = ev.detail;
      if (!text?.trim()) return;
      const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
      comments.unshift({
        id,
        author: 'vos',
        when: 'ahora',
        body: text,
        avatar: './assets/icons/avatar.svg',
        replies: [],
      });
      // por las dudas, limpiamos one-shot
      pendingOpenId = null;
      render();
    });

    render();
  }
}
customElements.define('comment-section', CommentSection);
