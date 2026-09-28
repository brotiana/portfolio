/* ════════════════════════════════════════════════════════════════════
   youtube-lite.js — façade « clic pour lire » des vidéos YouTube
   ────────────────────────────────────────────────────────────────────
   Le lecteur YouTube (≈1 Mo de JS/CSS + nombreuses requêtes réseau) est
   très lourd. Ici il n'est chargé QU'AU CLIC : au chargement on affiche
   seulement la miniature + un bouton play. La page s'ouvre donc
   instantanément.

   Utilisation dans le HTML (à la place de l'<iframe>) :

     <div class="yt-lite" data-yt="VIDEO_ID"
          data-title="Titre de la vidéo"
          role="button" tabindex="0" aria-label="Lire la vidéo"></div>

   ➜ Ajoutez la classe du conteneur d'origine si besoin
     (ex. class="yt-lite project-video" pour getlike).
   ➜ Mettez l'ID YouTube dans data-yt.
 ════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var CSS =
        '.yt-lite{position:relative;display:block;width:100%;aspect-ratio:16/9;' +
        'background:#000 center/cover no-repeat;cursor:pointer;overflow:hidden;' +
        'border:0;padding:0;-webkit-tap-highlight-color:transparent}' +
        '.yt-lite>img{position:absolute;inset:0;width:100%;height:100%;' +
        'object-fit:cover;display:block;border:0}' +
        '.yt-lite::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,.22);' +
        'transition:background .25s ease}' +
        '.yt-lite:hover::after,.yt-lite:focus-visible::after{background:rgba(0,0,0,.05)}' +
        '.yt-lite .yt-lite-play{position:absolute;top:50%;left:50%;' +
        'transform:translate(-50%,-50%);width:68px;height:48px;border-radius:12px;' +
        'background:rgba(26,111,255,.85);display:flex;align-items:center;' +
        'justify-content:center;transition:background .25s ease,transform .25s ease;' +
        'z-index:2;pointer-events:none}' +
        '.yt-lite:hover .yt-lite-play,.yt-lite:focus-visible .yt-lite-play{' +
        'background:#1a6fff;transform:translate(-50%,-50%) scale(1.06)}' +
        '.yt-lite .yt-lite-play::before{content:"";border-style:solid;' +
        'border-width:11px 0 11px 19px;border-color:transparent transparent transparent #fff}' +
        '.yt-lite iframe{position:absolute;inset:0;width:100%;height:100%;border:0;z-index:3}' +
        /* milike : la vidéo reste dans son encadré .media-box */
        '.media-box .yt-lite{width:100%;aspect-ratio:16/9;min-height:500px;max-height:520px}' +
        '@media (max-width:768px){.media-box .yt-lite{min-height:0;max-height:none}}';

    function injectStyle() {
        var s = document.createElement('style');
        s.setAttribute('data-youtube-lite', '');
        s.appendChild(document.createTextNode(CSS));
        document.head.appendChild(s);
    }

    function buildFacade(box) {
        var id = box.getAttribute('data-yt');
        if (!id) return;
        var title = box.getAttribute('data-title') || 'Vidéo YouTube';

        var img = document.createElement('img');
        img.src = 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
        img.alt = 'Aperçu : ' + title;
        img.loading = 'lazy';
        img.decoding = 'async';

        var play = document.createElement('span');
        play.className = 'yt-lite-play';
        play.setAttribute('aria-hidden', 'true');

        box.appendChild(img);
        box.appendChild(play);

        if (!box.hasAttribute('role')) box.setAttribute('role', 'button');
        if (!box.hasAttribute('tabindex')) box.setAttribute('tabindex', '0');
        if (!box.hasAttribute('aria-label')) box.setAttribute('aria-label', 'Lire la vidéo : ' + title);
    }

    function activate(box) {
        var id = box.getAttribute('data-yt');
        if (!id || box.getAttribute('data-yt-active')) return;
        box.setAttribute('data-yt-active', '1');

        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
                     '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
        iframe.title = box.getAttribute('data-title') || 'Vidéo YouTube';
        iframe.setAttribute('allow',
            'accelerometer; autoplay; clipboard-write; encrypted-media; ' +
            'gyroscope; picture-in-picture; web-share');
        iframe.setAttribute('allowfullscreen', '');

        box.innerHTML = '';
        box.appendChild(iframe);
        box.setAttribute('aria-label', box.getAttribute('data-title') || 'Vidéo YouTube');
    }

    function init() {
        injectStyle();
        var boxes = document.querySelectorAll('.yt-lite[data-yt]');
        for (var i = 0; i < boxes.length; i++) {
            buildFacade(boxes[i]);
        }
    }

    document.addEventListener('click', function (e) {
        var box = e.target && e.target.closest ? e.target.closest('.yt-lite[data-yt]') : null;
        if (box) { e.preventDefault(); activate(box); }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        var box = e.target && e.target.closest ? e.target.closest('.yt-lite[data-yt]') : null;
        if (box) { e.preventDefault(); activate(box); }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
