const games = {
    "peg-solitaire": {
        title: "Green Lantern: El Solitario Esmeralda",
        poster: "./assets/peg-solitaire.png",
        rating: "5.0",
        releaseDate: "2009-01-01",
        clamp: "3",
        type: "peg-solitaire",
        description:
            "En un rincón olvidado del universo, los Guardianes del Oa te encomiendan la misión más insólita jamás vista: ¡resolver el enigma cósmico del Peg Solitaire! Como nuevo recluta del Cuerpo de Linternas Verdes, deberás dominar este ancestral juego de estrategia que ha desafiado a los más grandes héroes de la galaxia.",
        facebook: "https://facebook.com/groups/pegsolitaire",
        x: "https://x.com/PegSolitaireGame",
        instagram: "https://instagram.com/pegsolitaire_official",
        tiktok: "https://tiktok.com/@pegsolitaire",
        youtube: "https://youtube.com/@PegSolitaireGameplay",
        facebookText: "Peg Solitaire Fans",
        xText: "@PegSolitaireGame",
        instagramText: "@pegsolitaire_official",
        tiktokText: "@pegsolitaire",
        youtubeText: "Peg Solitaire Gameplay"
    },
    "blocka": {
        title: "Blocka: Rompecabezas de Linterna Verde",
        poster: "./assets/gameCover.jpg",
        rating: "4.8",
        releaseDate: "2025-01-01",
        clamp: "3",
        type: "blocka",
        description:
            "Los Guardianes de Oa han creado un nuevo entrenamiento para los Linternas Verdes: Blocka, un desafío mental que pone a prueba tu percepción espacial y velocidad. Las imágenes del universo DC han sido fragmentadas y distorsionadas. Tu misión es rotarlas correctamente antes de que el tiempo se agote.",
        facebook: "https://facebook.com/groups/blocka",
        x: "https://x.com/BlockaGame",
        instagram: "https://instagram.com/blocka_official",
        tiktok: "https://tiktok.com/@blocka_game",
        youtube: "https://youtube.com/@BlockaGameplay",
        facebookText: "Blocka Fans",
        xText: "@BlockaGame",
        instagramText: "@blocka_official",
        tiktokText: "@blocka_game",
        youtubeText: "Blocka Gameplay"
    }
};

(function () {
    // Get game from URL params
    const params = new URLSearchParams(location.search);
    const gameId = params.get("game") || "peg-solitaire";
    const data = games[gameId] || games["peg-solitaire"];

    // Set title and header
    document.title = `${data.title} - RushGame`;
    document.getElementById("gameTitle").textContent = data.title;

    function escapeHtml(str) {
        // Skip quotes for inner HTML, only escape &, <, >
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function escapeHtmlAttr(str) {
        // Skip > for attributes, only escape &, ", <
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;");
    }

    function showInstructions(type) {
        return `<rush-game-instructions game-type="${type}"></rush-game-instructions>`;
    }

    // Show game component based on type
    const layout = document.getElementById("gameLayout");
    if (data.type === "peg-solitaire") {
        layout.innerHTML = '<rushgame-peg-solitaire></rushgame-peg-solitaire>';
        layout.innerHTML += showInstructions("peg-solitaire");
        import("./components/peg-solitaire/peg-solitaire.js")
            .then(() => {
                const tag = "rushgame-peg-solitaire";
                if (!customElements.get(tag)) {
                    return customElements.whenDefined(tag).catch((err) => {
                        console.error(`El custom element ${tag} no se definió:`, err);
                        layout.innerHTML = '<div class="error">Error inicializando Peg Solitaire (revisá la consola).</div>';
                    });
                }
            })
            .catch((err) => {
                console.error("Error importando components/peg-solitaire/peg-solitaire.js:", err);
                const pegSolitaireEl = layout.querySelector("rushgame-peg-solitaire");
                if (pegSolitaireEl) pegSolitaireEl.replaceWith(document.createElement("div")).textContent = "No se pudo cargar el juego Peg Solitaire. Revisa la consola.";
            });
    } else if (data.type === "blocka") {
        layout.innerHTML = '<rushgame-blocka></rushgame-blocka>';
        layout.innerHTML += showInstructions("blocka");

        import("./components/blocka/blocka.js")
            .then(() => {
                const tag = "rushgame-blocka";
                if (!customElements.get(tag)) {
                    return customElements.whenDefined(tag).catch((err) => {
                        console.error(`El custom element ${tag} no se definió:`, err);
                        layout.innerHTML = '<div class="error">Error inicializando Blocka (revisá la consola).</div>';
                    });
                }
            })
            .catch((err) => {
                console.error("Error importando components/blocka/blocka.js:", err);
                const blockaEl = layout.querySelector("rushgame-blocka");
                if (blockaEl) blockaEl.replaceWith(document.createElement("div")).textContent = "No se pudo cargar el juego Blocka. Revisa la consola.";
            });
    }
    
    // Set game description
    const descContainer = document.getElementById("gameDescriptionContainer");
    const socialKeys = ['facebook', 'x', 'instagram', 'tiktok', 'youtube'];
    const socialAttrs = socialKeys.flatMap((k) => {
        const parts = [];
        if (data[k]) parts.push(`${k}="${escapeHtmlAttr(data[k])}"`);
        const txtProp = `${k}Text`;
        if (data[txtProp]) parts.push(`${k}-text="${escapeHtmlAttr(data[txtProp])}"`);
        return parts;
    }).join(' ');

    descContainer.innerHTML = `
    <game-description
        title="${escapeHtmlAttr(data.title)}"
        poster="${escapeHtmlAttr(data.poster)}"
        rating="${data.rating}"
        release-date="${data.releaseDate}"
        clamp="${data.clamp}"
        ${socialAttrs}>
        <div slot="description">
            ${escapeHtml(data.description)}
        </div>
    </game-description>`;
})();