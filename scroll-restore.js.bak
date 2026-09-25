/* ════════════════════════════════════════════════════
   Sauvegarde / restauration de la position de scroll — pages de projet
   Chaque page garde sa propre position (clé basée sur le chemin).
   Au retour sur une page déjà visitée, on atterrit exactement
   là où on s'était arrêté.
════════════════════════════════════════════════════ */
(function () {
    // Désactive la restauration auto du navigateur (on gère nous-mêmes)
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Clé unique par page (ex: /portfolio-main/getlike/getlike.html)
    var KEY = 'scrollPos_' + location.pathname;

    // Sauvegarde avant de quitter la page
    function save() {
        try {
            sessionStorage.setItem(KEY, window.scrollY);
        } catch (e) {}
    }
    window.addEventListener('beforeunload', save);
    // pagehide couvre aussi le cas bfcache (où beforeunload ne se déclenche pas)
    window.addEventListener('pagehide', save);

    function restore() {
        var saved = null;
        try {
            saved = sessionStorage.getItem(KEY);
        } catch (e) {}
        if (saved === null) return;
        try {
            sessionStorage.removeItem(KEY);
        } catch (e) {}

        var pos = parseInt(saved, 10) || 0;

        function apply() {
            window.scrollTo(0, pos);
        }

        apply();
        requestAnimationFrame(apply);

        // Ré-applique pendant ~2s (attente des images / layout)
        var tries = 0;
        var timer = setInterval(function () {
            apply();
            if (++tries > 20) clearInterval(timer);
        }, 100);
    }

    window.addEventListener('load', restore);
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) restore();
    });
})();
