const EMAILJS_SERVICE_ID  = 'service_3mmhbu8';


const EMAILJS_TEMPLATE_ID = 'template_32bqdsb';

const EMAILJS_PUBLIC_KEY  = 'zIWwtI3fiMRCD1iaY';

const CONTACT_EMAIL       = 'gtiana337@gmail.com';


document.addEventListener('DOMContentLoaded', function() {

    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.style.display = 'block';
        homeSection.style.opacity = '1';
        homeSection.style.transform = 'none';
    }


    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        if (!section.classList.contains('active')) {
            section.style.display = 'none';
        }
    });

    initializeAnimations();
    initializeMobileMenu();
    initializeContactForm();
    initializeScrollAnimations();


    // Sélecteur de langue : applique la langue mémorisée/détectée + branche les boutons
    // (applyLanguage relance aussi l'effet machine à écrire via resetTypingEffect)
    initLangSwitch();


    // Aimantation « hero <-> Bio » de l'accueil (gérée en JS, cf. plus bas)
    initHomeSnap();

    const homeIconBtn = document.getElementById('homeIconBtn');
    if (homeIconBtn) {
        homeIconBtn.addEventListener('click', function () {
            // L'icône Accueil = toujours revenir sur le hero (haut de #home).
            // Quand on est déjà sur l'accueil (ex. panneau Bio), showSection('home')
            // ne fait rien (même section) : il faut remonter le défilement de #home.
            sectionScrollMemory['home'] = 0;
            const currentActive = document.querySelector('.section.active');
            if (currentActive && currentActive.id === 'home') {
                // Remonter en douceur vers le hero (animation maison : homeAnimateTo)
                homeAnimateTo(0);
            } else {
                showSection('home');
            }
        });
    }


    let isNavigating = false;
    window.addEventListener('scroll', function() {
        if (isNavigating) return;
    });
});


// ── Mémoire de scroll par section ──────────────────────────────────
// Chaque section conserve sa dernière position de défilement : quand on
// revient dessus, on repart là où on s'était arrêté.
// NB : selon l'écran le conteneur qui défile est la fenêtre OU <body>
// (cas du zoom 75%), et #home a son propre défilement interne.
var sectionScrollMemory = {};

function getPageScroll() {
    return window.scrollY ||
           document.documentElement.scrollTop ||
           document.body.scrollTop || 0;
}

function setPageScroll(y) {
    window.scrollTo(0, y);
    if (document.documentElement) document.documentElement.scrollTop = y;
    if (document.body) document.body.scrollTop = y;
}

function getSectionScroll(section) {
    if (!section) return 0;
    // #home défile en interne ; les autres sections utilisent le défilement page.
    if (section.id === 'home') return section.scrollTop || 0;
    return getPageScroll();
}

function setSectionScroll(section, y) {
    if (!section) return;
    if (section.id === 'home') {
        section.scrollTop = y;
    } else {
        setPageScroll(y);
    }
}

// ── Accueil : aimantation « hero <-> Bio » (animée en JS) ───────────
// Le scroll-snap CSS n'a aucun cran en haut (le hero est sticky top:-25vh),
// on gère donc l'aimantation nous-mêmes, avec une animation bien visible.
var homeSnapAnim = false;
var homeSnapTimer = null;
var homeSnapLastY = 0;
var homeSnapDir = 1;
var homeSnapRAF = null;

function homeEase(t) {                       // easeInOutCubic : hésitation + glisse
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function homeAnimateTo(target, duration) {
    var home = document.getElementById('home');
    if (!home) return;
    var start = home.scrollTop;
    var delta = target - start;
    if (Math.abs(delta) < 1) return;
    var dur = duration || 577;      // 750 / 1.3 ≈ 577 ms (effet accéléré ×1.3)
    var t0 = null;
    homeSnapAnim = true;
    function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        home.scrollTop = start + delta * homeEase(p);
        if (p < 1) {
            homeSnapRAF = requestAnimationFrame(step);
        } else {
            home.scrollTop = target;
            homeSnapLastY = target;
            homeSnapAnim = false;
        }
    }
    homeSnapRAF = requestAnimationFrame(step);
}

function initHomeSnap() {
    var home = document.getElementById('home');
    if (!home) return;

    // On pilote nous-mêmes : plus de snap CSS ni de défilement animé natif
    home.style.scrollSnapType = 'none';
    home.style.scrollBehavior = 'auto';
    homeSnapLastY = home.scrollTop;

    function homeMax() { return home.scrollHeight - home.clientHeight; }

    // Un élément interne (ex. la zone de texte du Bio) peut-il encore défiler ?
    function innerCanScroll(node, dir) {
        var el = node;
        while (el && el !== home) {
            var sh = el.scrollHeight, ch = el.clientHeight;
            if (sh > ch + 1) {
                if (dir > 0 && el.scrollTop + ch < sh - 1) return true;
                if (dir < 0 && el.scrollTop > 1) return true;
            }
            el = el.parentElement;
        }
        return false;
    }

    // Une intention de défilement -> TOUJOURS la même transition animée entre
    // les deux crans (hero <-> Bio), quel que soit l'outil (molette, clavier,
    // tactile). On empêche ainsi le défilement natif « jusqu'au milieu ».
    function go(dir) {
        if (homeSnapAnim) return false;
        var max = homeMax();
        if (max <= 1) return false;
        homeAnimateTo(dir < 0 ? 0 : max);
        return true;
    }

    // 1) Molette souris / trackpad
    home.addEventListener('wheel', function (e) {
        if (!e.deltaY) return;
        var dir = e.deltaY > 0 ? 1 : -1;
        if (innerCanScroll(e.target, dir)) return;      // laisser la zone interne défiler
        e.preventDefault();
        go(dir);
    }, { passive: false });

    // 2) Clavier : flèches, Page suiv./préc., Espace (quand l'accueil est affiché)
    document.addEventListener('keydown', function (e) {
        var active = document.querySelector('.section.active');
        if (!active || active.id !== 'home') return;

        var dir = (e.key === 'ArrowDown' || e.key === 'PageDown' ||
                   e.key === ' ' || e.key === 'Spacebar') ? 1
                : (e.key === 'ArrowUp' || e.key === 'PageUp') ? -1 : 0;
        if (!dir) return;

        var tag = (e.target && e.target.tagName || '').toLowerCase();
        if ((e.key === ' ' || e.key === 'Spacebar') &&
            (tag === 'a' || tag === 'button' || tag === 'input' || tag === 'textarea')) {
            return;                                     // laisser le bouton/lien agir
        }
        if (innerCanScroll(e.target, dir)) return;
        if (go(dir)) e.preventDefault();
    });

    // 3) Tactile (on bloque le défilement natif pour garder le même effet)
    var touchY = null;
    home.addEventListener('touchstart', function (e) {
        touchY = e.touches[0].clientY;
    }, { passive: true });
    home.addEventListener('touchmove', function (e) {
        if (touchY === null) return;
        var dy = touchY - e.touches[0].clientY;         // doigt vers le haut -> descendre
        if (Math.abs(dy) < 12) return;
        var dir = dy > 0 ? 1 : -1;
        if (innerCanScroll(e.target, dir)) return;
        e.preventDefault();
        touchY = null;
        go(dir);
    }, { passive: false });
    home.addEventListener('touchend', function () { touchY = null; }, { passive: true });

    // Filet de sécurité : défilement non intercepté -> aimantation au cran
    home.addEventListener('scroll', function () {
        if (homeSnapAnim) return;                       // on ignore nos animations
        var y = home.scrollTop;
        if (y !== homeSnapLastY) {
            homeSnapDir = y > homeSnapLastY ? 1 : -1;
            homeSnapLastY = y;
        }
        clearTimeout(homeSnapTimer);
        homeSnapTimer = setTimeout(function () {
            if (homeSnapAnim) return;
            var max = homeMax();
            if (max <= 1) return;
            var pos = home.scrollTop;
            if (pos <= 1 || pos >= max - 1) return;      // déjà sur un cran
            homeAnimateTo(homeSnapDir > 0 ? max : 0);
        }, 120);
    }, { passive: true });
}

function showSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    const currentActive = document.querySelector('.section.active');


    if (currentActive && currentActive.id === sectionId) return;

    // Mémorise la position de la section qu'on quitte (AVANT de la masquer,
    // sinon la hauteur du contenu change et la position serait perdue).
    if (currentActive) {
        sectionScrollMemory[currentActive.id] = getSectionScroll(currentActive);
    }

    const displayNew = () => {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        targetSection.style.opacity = '0';
        // Restaure la dernière position mémorisée de la section cible.
        var savedScroll = sectionScrollMemory[targetSection.id] || 0;
        setSectionScroll(targetSection, savedScroll);
        requestAnimationFrame(function () {
            setSectionScroll(targetSection, savedScroll);
        });

        anime({
            targets: targetSection,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 400,
            easing: 'easeOutQuad'
        });
    };

    if (currentActive) {
        anime({
            targets: currentActive,
            opacity: [1, 0],
            translateY: [0, -20],
            duration: 300,
            easing: 'easeInQuad',
            complete: displayNew
        });
    } else {
        displayNew();
    }


    if (window.location.hash !== `#${sectionId}`) {
        window.history.pushState(null, null, `#${sectionId}`);
    }
}


function animateSectionElements(sectionId) {

}


let typingTimer = null;

function initializeTypingEffect() {
    // Annule la boucle précédente : sinon, au changement de langue, deux boucles
    // écrivent en même temps dans #typed-text → le texte clignote/débloque.
    if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
    }
    const typedEl = document.getElementById('typed-text');
    if (typedEl) typedEl.textContent = '';

    const getTypingTexts = () => {
        return [
            translations[currentLanguage]['hero-subtitle-2'],
            translations[currentLanguage]['hero-subtitle-3'],
            translations[currentLanguage]['hero-subtitle-4']
        ];
    };

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeText() {
        const texts = getTypingTexts();
        const currentText = texts[textIndex] || '';
        const typedTextElement = document.getElementById('typed-text');

        if (!typedTextElement) return;

        if (isDeleting) {
            typedTextElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typedTextElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
        }

        typingTimer = setTimeout(typeText, typeSpeed);
    }

    typeText();
}


function resetTypingEffect() {
    initializeTypingEffect();
}


function initializeAnimations() {

    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            anime({
                targets: card.querySelector('.skill-icon'),
                scale: [1, 1.2],
                rotate: [0, 10],
                duration: 300,
                easing: 'easeOutQuad'
            });
        });

        card.addEventListener('mouseleave', () => {
            anime({
                targets: card.querySelector('.skill-icon'),
                scale: [1.2, 1],
                rotate: [10, 0],
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
}


function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
}


function initializeContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }
}

function handleContactSubmit(e) {
    e.preventDefault();

    const form = e.target;


    if (form.botcheck && form.botcheck.value) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;

    const restoreButton = () => {
        submitBtn.innerHTML = originalHTML;
        submitBtn.disabled = false;
    };

    submitBtn.innerHTML = 'Sending...';
    submitBtn.disabled = true;


    if (typeof emailjs === 'undefined') {
        restoreButton();
        showNotification('Email service unavailable. Please try again later.', 'error');
        return;
    }

    emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
            from_name:  data.name,
            from_email: data.email,
            reply_to:   data.email,
            subject:    data.subject,
            message:    data.message,
            to_email:   CONTACT_EMAIL
        },
        { publicKey: EMAILJS_PUBLIC_KEY }
    )
    .then(() => {
        showNotification('Message sent successfully!', 'success');
        form.reset();
        restoreButton();
    })
    .catch((error) => {
        console.error('EmailJS error:', error);
        const detail = (error && (error.text || error.message)) ? (error.text || error.message) : 'Unknown error';
        showNotification('Error: ' + detail, 'error');
        restoreButton();
    });
}


function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bg = type === 'success' ? 'bg-green-600'
             : (type === 'error' || type === 'danger') ? 'bg-red-600'
             : 'bg-blue-600';
    notification.className = `fixed top-24 right-4 p-4 rounded-lg z-50 ${bg} text-white`;
    notification.textContent = message;

    document.body.appendChild(notification);

    anime({
        targets: notification,
        translateX: [300, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });

    setTimeout(() => {
        anime({
            targets: notification,
            translateX: [0, 300],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                document.body.removeChild(notification);
            }
        });
    }, 3000);
}


function initializeScrollAnimations() {

    const revealCSS = document.createElement('style');
    revealCSS.textContent = `
        .reveal-item {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 0.6s cubic-bezier(.22,1,.36,1), transform 0.6s cubic-bezier(.22,1,.36,1);
        }
        .reveal-item.revealed {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(revealCSS);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {

                const parent = entry.target.parentElement;
                const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal-item'));
                const idx = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${idx * 80}ms`;
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });


    function observeItems() {
        document.querySelectorAll('.skill-card, .project-row, #skills .grid > div:not(.skill-card)').forEach(el => {
            if (!el.classList.contains('reveal-item')) {
                el.classList.add('reveal-item');
                observer.observe(el);
            }
        });
    }


    observeItems();
    const origShowSection = window._origShowSection || showSection;
    if (!window._origShowSection) {
        window._origShowSection = showSection;
    }

    const mutObs = new MutationObserver(() => {
        observeItems();
    });
    document.querySelectorAll('.section').forEach(s => {
        mutObs.observe(s, { attributes: true, attributeFilter: ['style', 'class'] });
    });
}


function openProject(projectId) {
    showNotification(`Project ${projectId} - In development`, 'info');
}


window.addEventListener('popstate', function(e) {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showSection(hash);
    } else {
        showSection('home');
    }
});


document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
        const hash = anchor.getAttribute('href').substring(1);


        if (hash === 'bio') {
            e.preventDefault();
            const homeSection = document.getElementById('home');
            const currentActive = document.querySelector('.section.active');

            if (currentActive && currentActive.id === 'home') {

                const bioPanel = homeSection.querySelector('.relative.z-10');
                if (bioPanel) bioPanel.scrollIntoView({ behavior: 'smooth' });
            } else {

                showSection('home');
                setTimeout(() => {
                    const bioPanel = document.querySelector('#home .relative.z-10');
                    if (bioPanel) bioPanel.scrollIntoView({ behavior: 'smooth' });
                }, 500);
            }
            return;
        }

        if (hash && document.getElementById(hash)) {
            e.preventDefault();
            showSection(hash);
        } else if (anchor.getAttribute('href') === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
});


function createFloatingParticles() {
    const particleCount = 50;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 2px;
            height: 2px;
            background: rgba(147, 51, 234, 0.3);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
        `;

        document.body.appendChild(particle);
        particles.push({
            element: particle,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
        });
    }

    function animateParticles() {
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
            if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;

            particle.element.style.left = particle.x + 'px';
            particle.element.style.top = particle.y + 'px';
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}









function initializeTooltips() {
    const skillCards = document.querySelectorAll('.skill-card');

    skillCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const tooltip = document.createElement('div');
            tooltip.className = 'absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap z-50';
            tooltip.textContent = 'Click to learn more';
            card.style.position = 'relative';
            card.appendChild(tooltip);
        });

        card.addEventListener('mouseleave', () => {
            const tooltip = card.querySelector('.absolute');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });
}





// ════════════════════════════════════════════════════════════════════
//  TRADUCTIONS FR / EN — application instantanée, sans rechargement.
//  Toutes les chaînes visibles passent par ce dictionnaire : au clic on
//  réécrit le DOM en UNE seule passe synchrone (aucun délai, aucun réseau).
//  Pour ajouter une langue : dupliquer le bloc et ajouter le bouton.
// ════════════════════════════════════════════════════════════════════
const translations = {
    fr: {
        'nav-bio': 'Bio',
        'nav-skills': 'Compétences',
        'nav-projects': 'Projets',
        'nav-contact': 'Contact',

        'hero-title': 'Développeur Fullstack',
        'hero-subtitle-1': 'Développeur Fullstack',
        'hero-subtitle-2': 'Créateur de solutions web',
        'hero-subtitle-3': 'Passionné par l\'innovation',
        'hero-subtitle-4': 'Expert en automatisation',
        'hero-desc': 'Passionné par l\'automatisation et les applications web performantes. Je transforme des problèmes répétitifs en solutions intelligentes et modernes.',
        'hero-btn-projects': 'VOIR MES PROJETS',

        'bio-title': 'Ma Bio',
        'bio-p1': 'Je m\'appelle <span class="text-white font-bold drop-shadow-md">Tiana</span>, je viens de Madagascar, développeur Full Stack passionné par la création, l\'automatisation et la résolution de problèmes.',
        'bio-p2': 'Il y a quatre ans, j\'ai commencé à réaliser des tâches sur Internet sur plusieurs plateformes pour gagner un peu d\'argent. Au bout d\'un moment, je me suis demandé : <em class="text-blue-300 font-medium tracking-wide">« et si j\'automatisais ces tâches ? »</em>',
        'bio-p3': 'C\'est alors que j\'ai commencé à me renseigner et à apprendre à automatiser des choses dans les navigateurs et sur les téléphones Android. J\'ai réalisé que devenir développeur me simplifiait énormément la vie, je m\'y suis donc profondément intéressé, et c\'est ce qui m\'a poussé à devenir développeur Full Stack.',
        'bio-p4': 'En 2025, j\'ai obtenu ma licence en génie logiciel, et je suis aujourd\'hui étudiant en Master au CNTEMAD. Durant ce parcours, j\'ai aussi appris à utiliser l\'IA, car la façon de construire les choses a complètement changé avec son arrivée.',
        'bio-p5': 'J\'ai réalisé plus de 10 projets que je considère comme un travail sérieux et professionnel depuis que je suis devenu développeur. Vous pouvez les découvrir dans la section <a href="#projects" class="text-blue-400 hover:text-blue-300 transition-colors font-semibold underline underline-offset-4 decoration-blue-500/50 hover:decoration-blue-400">Projets</a> de mon portfolio.',

        'skills-title': 'Mes Compétences',
        'skill-1': 'Structure sémantique et accessibilité',
        'skill-2': 'Design moderne et animations',
        'skill-3': 'Framework CSS utilitaire',
        'skill-4': 'Dynamisme et interactivité',
        'skill-5': 'Architecture d\'interface à composants',
        'skill-6': 'Animations web professionnelles',
        'skill-7': 'Backend robuste et performant',
        'skill-8': 'Scripting et automatisation',
        'skill-9': 'Base de données relationnelle',
        'skill-10': 'Base de données relationnelle avancée',
        'skill-11': 'Base de données légère',
        'skill-12': 'Automatisation sans code',

        'projects-title': 'Mes Projets',
        'proj1-title': 'KVMSOFT',
        'proj1-desc': 'KVMSoft vous permet de taper sur un ordinateur avec le clavier d\'une autre machine, via un réseau local ou un VPN — sans câble ni matériel supplémentaire.',
        'proj2-title': 'ShadowMind',
        'proj2-desc': 'Édition riche : texte, couleurs, images, audio, tableaux.<br>Lecture vocale intelligente : en français et en anglais.<br>Notes synchronisées : accessibles depuis tous vos appareils.',
        'proj3-title': 'MIIA Editor',
        'proj3-desc': 'Un éditeur de code Linux avec un agent IA intégré et des outils dédiés pour simplifier et accélérer le développement d\'applications web et de scripts.',
        'proj4-title': 'miLike',
        'proj4-desc': 'Automatisation d\'actions sur INSTAGRAM : liker, suivre, commenter, publier des posts et des stories, supprimer des posts.',
        'proj5-title': 'getlike.io + automatisation de tâches TikTok',
        'proj5-desc': 'getlike.io est une plateforme qui propose des tâches (liker, suivre, commenter des comptes et publications TikTok) afin de gagner de l\'argent. Ce projet automatise ces tâches.',
        'proj6-title': 'SmmKingdomTasks + HelpCercle_bot',
        'proj6-desc': 'SmmKingdomTasks est un bot Telegram qui propose des tâches (liker, suivre, commenter des comptes TikTok et Instagram) afin de gagner de l\'argent. Cette application Android automatise ces tâches via le service d\'accessibilité.',
        'proj7-title': 'Jeu d\'échecs en ligne',
        'proj7-desc': 'Une plateforme web où vous pouvez jouer aux échecs contre d\'autres joueurs en ligne ou vous entraîner contre l\'ordinateur. Les joueurs peuvent discuter avec leur adversaire pendant la partie, directement depuis l\'interface. Elle propose aussi une option pour regarder les parties publiques en cours.',
        'proj8-title': 'HelpCercle',
        'proj8-desc': 'HelpCercle est une application web où les utilisateurs peuvent proposer un service contre rémunération ou publier une demande pour un service dont ils ont besoin.',
        'proj9-title': 'Sayit',
        'proj9-desc': 'Une application web qui permet de recevoir des messages anonymes. Il faut créer un compte et récupérer son lien unique, puis le partager sur les réseaux sociaux. Vous recevez une notification par email et sur votre tableau de bord dès que quelqu\'un visite votre lien et vous envoie un message.',
        'proj10-title': 'tikDown',
        'proj10-desc': 'Pour télécharger des vidéos TikTok, en HD et sans filigrane.',

        'contact-title': 'Me Contacter',
        'contact-subtitle': 'Un projet en tête ? Construisons quelque chose d\'exceptionnel ensemble.',
        'contact-label-email': 'Email',
        'contact-label-phone': 'Téléphone',
        'contact-label-location': 'Localisation',
        'contact-social-title': 'Connectez-vous avec moi',
        'contact-form-title': 'Envoyez-moi un message',
        'ph-name': 'Votre nom',
        'ph-email': 'Votre email',
        'ph-subject': 'Sujet',
        'ph-message': 'Parlez-moi de votre projet...',
        'btn-send': 'Envoyer le message',

        'skills-cap-title': 'Que puis-je faire avec ces compétences ?',
        'cap-1': 'Créer des sites web modernes et complets',
        'cap-2': 'Scraper et extraire des données web',
        'cap-3': 'Manipuler et stocker des données en base',
        'cap-4': 'Automatiser des actions sur sites web, PC et Android',
        'cap-5': 'Créer des applications Android, Linux et Windows avec des technologies web',
        'cap-6': 'Créer des bots pour Facebook, Instagram, Telegram, Gmail et WhatsApp',
        'cap-7': 'Automatiser les workflows de publication sur les réseaux sociaux',
        'cap-8': 'Entraîner l\'IA et intégrer des modèles pré-entraînés',
        'cap-9': 'Héberger des sites et des scripts sur des serveurs cloud',
        'cap-10': 'Développer des systèmes de paiement basés sur la blockchain',

        'sayit-title': 'Redirection externe',
        'sayit-text': 'Vous allez être redirigé vers un site externe.<br>Une nouvelle fenêtre va s\'ouvrir.',
        'sayit-cancel': 'Annuler',
        'sayit-continue': 'Continuer',
        'tikdown-title': 'Projet tikDown',
        'tikdown-text': 'Découvrez tikDown : un outil pour télécharger des vidéos TikTok en HD et sans filigrane.',
        'tikdown-close': 'Fermer',
        'tikdown-view': 'Voir sur GitHub',
        'sm-desc': 'Plateforme de prise de notes de nouvelle génération.',
        'sm-f1': 'Édition riche<br>texte, couleurs, images, audio, tableaux',
        'sm-f2': 'Synthèse vocale<br>français et anglais',
        'sm-f3': 'Notes synchronisées<br>disponibles sur tous vos appareils',
        'sm-f4': 'Stockage sécurisé<br>chiffré de bout en bout',
        'sm-close': 'Fermer',
        'sm-open': 'Ouvrir le site',
        'miia-desc': 'Pourquoi créer un autre éditeur de code alors que des éditeurs puissant comme VS Code existent déjà ?',
        'miia-f1': '<b style="color:#e2e8f0;">Outils personnalisés pour l\'IA :</b> je voulais une liberté totale pour doter l\'agent IA de mes propres outils spécialisés.',
        'miia-f2': '<b style="color:#e2e8f0;">Contrôle des tokens et des coûts :</b> pour minimiser la consommation de tokens IA.',
        'miia-f3': '<b style="color:#e2e8f0;">Personnalisation sans limites :</b> pour créer des fonctionnalités, des ajustements d\'interface et des thèmes sur mesure, sans les restrictions imposées par les éditeurs propriétaires.',
        'miia-f4': '<b style="color:#e2e8f0;">Montée en compétences et indépendance :</b> pour progresser en ingénierie tout en sortant des sentiers battus.',
        'miia-close': 'Fermer',
        'miia-download': 'Télécharger l\'app'
    },
    en: {
        'nav-bio': 'Bio',
        'nav-skills': 'Skills',
        'nav-projects': 'Projects',
        'nav-contact': 'Contact',

        'hero-title': 'Fullstack Developer',
        'hero-subtitle-1': 'Fullstack Developer',
        'hero-subtitle-2': 'Web solutions creator',
        'hero-subtitle-3': 'Passionate about innovation',
        'hero-subtitle-4': 'Automation Expert',
        'hero-desc': 'Passionate about automation and high-performance web applications. I turn repetitive problems into smart, modern solutions.',
        'hero-btn-projects': 'VIEW MY PROJECTS',

        'bio-title': 'My Bio',
        'bio-p1': 'My name is <span class="text-white font-bold drop-shadow-md">Tiana</span>, I\'m from Madagascar, a Full Stack Developer with a passion for creation, automation and problem-solving.',
        'bio-p2': 'Four years ago, I started doing tasks on the Internet across several platforms to earn some income. After a while, I began wondering: <em class="text-blue-300 font-medium tracking-wide">"what if I automated these tasks?"</em>',
        'bio-p3': 'That\'s when I started researching and learning how to automate things in browsers and on Android phones. I realized that being a developer was making my life much easier, so I became deeply interested in it, and that\'s what drove me toward becoming a Full Stack Developer.',
        'bio-p4': 'In 2025, I earned my Bachelor\'s degree in Software Engineering, and I am now a Master\'s student at CNTEMAD. During that journey, I also learned to use AI, because the way of building things changed completely once it arrived.',
        'bio-p5': 'I have completed more than 10 projects that I consider serious, professional work since becoming a developer. You can explore them in the <a href="#projects" class="text-blue-400 hover:text-blue-300 transition-colors font-semibold underline underline-offset-4 decoration-blue-500/50 hover:decoration-blue-400">Projects</a> section of my portfolio website.',

        'skills-title': 'My Skills',
        'skill-1': 'Semantic structure and accessibility',
        'skill-2': 'Modern design and animations',
        'skill-3': 'Utility-first CSS framework',
        'skill-4': 'Dynamics and interactivity',
        'skill-5': 'Component-based UI architecture',
        'skill-6': 'Professional web animations',
        'skill-7': 'Robust and performant backend',
        'skill-8': 'Scripting and automation',
        'skill-9': 'Relational database',
        'skill-10': 'Advanced relational database',
        'skill-11': 'Lightweight database',
        'skill-12': 'No-code automation',

        'projects-title': 'My Projects',
        'proj1-title': 'KVMSOFT',
        'proj1-desc': 'KVMSoft lets you type on a computer using the keyboard of another machine, over a local network or VPN, no cables and no extra hardware required.',
        'proj2-title': 'ShadowMind',
        'proj2-desc': 'Rich editing : text, colors, images, audio, tables.<br>Smart voice reading : in French and English.<br>Synced notes : accessible across all your devices.',
        'proj3-title': 'MIIA Editor',
        'proj3-desc': 'A Linux code editor with an integrated AI agent and dedicated tools designed to streamline and accelerate web app and script development.',
        'proj4-title': 'miLike',
        'proj4-desc': 'Automating actions on INSTAGRAM : like, follow, comment, publish posts and stories, delete posts.',
        'proj5-title': 'getlike.io + tiktok task automation',
        'proj5-desc': 'getlike.io is a platform that offers tasks such as liking, following, and commenting on TikTok accounts and posts in order to earn money. This project automates those tasks.',
        'proj6-title': 'SmmKingdomTasks + HelpCercle_bot',
        'proj6-desc': 'SmmKingdomTasks is a telegram bot that offers tasks such as liking, following, and commenting on TikTok and Instagram accounts and posts in order to earn money. This android application automates those tasks using Accessibility Service.',
        'proj7-title': 'Chess game online',
        'proj7-desc': 'A web platform where you can play chess against other players online or practice against the computer. Players can chat with their opponent during the game, right from the interface. It contains an option to let a user watch public games currently being played online.',
        'proj8-title': 'HelpCercle',
        'proj8-desc': 'HelpCercle is a web application where users can either offer a service in exchange for money or post a request for a service they need.',
        'proj9-title': 'Sayit',
        'proj9-desc': 'A web app that lets people message you anonymously. You need to create an account and get your unique link, then share it on social media. You will receive a notification on your email and your dashboard whenever someone visits your link and sends you a message.',
        'proj10-title': 'tikDown',
        'proj10-desc': 'For downloading video in tik tok, HD and without watermark',

        'contact-title': 'Get In Touch',
        'contact-subtitle': 'Have a project in mind? Let\'s build something amazing together.',
        'contact-label-email': 'Email',
        'contact-label-phone': 'Phone',
        'contact-label-location': 'Location',
        'contact-social-title': 'Connect with me',
        'contact-form-title': 'Send me a message',
        'ph-name': 'Your name',
        'ph-email': 'Your email',
        'ph-subject': 'Subject',
        'ph-message': 'Tell me about your project...',
        'btn-send': 'Send Message',

        'skills-cap-title': 'What can I do with these skills?',
        'cap-1': 'Build complete modern websites',
        'cap-2': 'Scrape and extract web data',
        'cap-3': 'Manipulate and store data in databases',
        'cap-4': 'Automate actions on websites, PCs, and Android',
        'cap-5': 'Build Android, Linux & Windows apps with web tech',
        'cap-6': 'Create bots for Facebook, Instagram, Telegram, Gmail & WhatsApp',
        'cap-7': 'Automate social media publishing workflows',
        'cap-8': 'Train AI and integrate pre-trained models',
        'cap-9': 'Host websites and scripts on cloud servers',
        'cap-10': 'Develop blockchain-based payment systems',

        'sayit-title': 'External Redirect',
        'sayit-text': 'You will be redirected to an external site.<br>A new window will open.',
        'sayit-cancel': 'Cancel',
        'sayit-continue': 'Continue',
        'tikdown-title': 'tikDown Project',
        'tikdown-text': 'Discover tikDown : a tool to download TikTok videos in HD without watermark.',
        'tikdown-close': 'Close',
        'tikdown-view': 'View on GitHub',
        'sm-desc': 'Next-generation note-taking platform.',
        'sm-f1': 'Rich editing<br>text, colors, images, audio, tables',
        'sm-f2': 'Text-to-speech<br>French &amp; English',
        'sm-f3': 'Synced notes<br>available on all your devices',
        'sm-f4': 'Secure storage<br>end-to-end encrypted',
        'sm-close': 'Close',
        'sm-open': 'Open website',
        'miia-desc': 'Why I build another code editor when powerhouses like VS Code already exist?',
        'miia-f1': '<b style=\"color:#e2e8f0;\">Custom Tooling for AI:</b> I wanted total freedom to equip the AI agent with my own specialized tools.',
        'miia-f2': '<b style=\"color:#e2e8f0;\">Token &amp; Cost Control:</b> To minimize AI token consumption.',
        'miia-f3': '<b style=\"color:#e2e8f0;\">Unrestricted Customization:</b> To build custom features, UI tweaks, and themes without running into the walls set by corporate-backed editors.',
        'miia-f4': '<b style=\"color:#e2e8f0;\">Skill Growth &amp; Independence:</b> To level up my engineering skills while stepping off the beaten path.',
        'miia-close': 'Close',
        'miia-download': 'Download app'
    }
};

// Langue initiale : mémorisée, sinon détectée depuis le navigateur
let currentLanguage = (function () {
    try {
        const saved = localStorage.getItem('language');
        if (saved === 'fr' || saved === 'en') return saved;
    } catch (e) {}
    return (navigator.language || '').toLowerCase().indexOf('fr') === 0 ? 'fr' : 'en';
})();

const SKILL_KEYS = ['skill-1', 'skill-2', 'skill-3', 'skill-4', 'skill-5', 'skill-6',
                    'skill-7', 'skill-8', 'skill-9', 'skill-10', 'skill-11', 'skill-12'];
const PROJECT_TITLE_KEYS = ['proj1-title', 'proj2-title', 'proj3-title', 'proj4-title',
                            'proj5-title', 'proj6-title', 'proj7-title', 'proj8-title',
                            'proj9-title', 'proj10-title'];
const PROJECT_DESC_KEYS = ['proj1-desc', 'proj2-desc', 'proj3-desc', 'proj4-desc',
                           'proj5-desc', 'proj6-desc', 'proj7-desc', 'proj8-desc',
                           'proj9-desc', 'proj10-desc'];
const CAP_KEYS = ['cap-1', 'cap-2', 'cap-3', 'cap-4', 'cap-5', 'cap-6', 'cap-7', 'cap-8', 'cap-9', 'cap-10'];
const SM_FEATURE_KEYS = ['sm-f1', 'sm-f2', 'sm-f3', 'sm-f4'];
const MIIA_FEATURE_KEYS = ['miia-f1', 'miia-f2', 'miia-f3', 'miia-f4'];
const BIO_KEYS = ['bio-p1', 'bio-p2', 'bio-p3', 'bio-p4', 'bio-p5'];
const CONTACT_LABEL_KEYS = ['contact-label-email', 'contact-label-phone', 'contact-label-location'];
const NAV_KEYS = { '#bio': 'nav-bio', '#skills': 'nav-skills', '#projects': 'nav-projects', '#contact': 'nav-contact' };

// Applique la langue en une seule passe synchrone (changement instantané)
function applyLanguage(lang) {
    const d = translations[lang] || translations.en;
    currentLanguage = lang;

    const setText = function (sel, key) {
        const el = document.querySelector(sel);
        if (el && d[key] != null) el.textContent = d[key];
    };
    const setHtml = function (sel, key) {
        const el = document.querySelector(sel);
        if (el && d[key] != null) el.innerHTML = d[key];
    };
    const setPh = function (sel, key) {
        const el = document.querySelector(sel);
        if (el && d[key] != null) el.placeholder = d[key];
    };
    const setList = function (sel, keys, asHtml) {
        const els = document.querySelectorAll(sel);
        for (let i = 0; i < els.length && i < keys.length; i++) {
            if (d[keys[i]] == null) continue;
            if (asHtml) els[i].innerHTML = d[keys[i]];
            else els[i].textContent = d[keys[i]];
        }
    };

    // Navigation (texte + data-text, utilisé par l'effet de survol)
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (a) {
        const k = NAV_KEYS[a.getAttribute('href')];
        if (k && d[k] != null) {
            a.textContent = d[k];
            a.setAttribute('data-text', d[k]);
        }
    });

    // Accueil
    setText('.hero-title', 'hero-title');
    setText('#home p.text-lg', 'hero-desc');
    setText('#home .plate2', 'hero-btn-projects');

    // Bio
    setText('#home > div:nth-child(2) h2', 'bio-title');
    setList('#home > div:nth-child(2) p', BIO_KEYS, true);

    // Compétences
    setText('#skills h2', 'skills-title');
    setList('#skills .skill-description', SKILL_KEYS);
    setText('#skills .mt-28 h3', 'skills-cap-title');
    setList('#skills .mt-28 .grid span', CAP_KEYS);

    // Projets
    setText('#projects h2', 'projects-title');
    setList('#projects .project-row h3', PROJECT_TITLE_KEYS);
    setList('#projects .project-row > p', PROJECT_DESC_KEYS, true);

    // Contact
    setText('#contact .contact-title', 'contact-title');
    setText('#contact .contact-subtitle', 'contact-subtitle');
    setList('#contact .contact-info-label', CONTACT_LABEL_KEYS);
    setText('#contactSocialTitle', 'contact-social-title');
    setText('#contactFormTitle', 'contact-form-title');
    setPh('#name', 'ph-name');
    setPh('#email', 'ph-email');
    setPh('#subject', 'ph-subject');
    setPh('#message', 'ph-message');
    setText('#sendBtnText', 'btn-send');

    setText('#sayitModal .sayit-modal-title', 'sayit-title');
    setHtml('#sayitModal .sayit-modal-text', 'sayit-text');
    setText('#sayitModal .sayit-btn-cancel', 'sayit-cancel');
    setText('#sayitModal .sayit-btn-confirm', 'sayit-continue');

    setText('#tikDownModal .sayit-modal-title', 'tikdown-title');
    setText('#tikDownModal .sayit-modal-text', 'tikdown-text');
    setText('#tikDownModal .sayit-btn-cancel', 'tikdown-close');
    setText('#tikDownModal .sayit-btn-confirm', 'tikdown-view');

    setText('#shadowMindModal .sayit-modal-text', 'sm-desc');
    setList('#shadowMindModal .shadowmind-feature span', SM_FEATURE_KEYS, true);
    setText('#shadowMindModal .sayit-btn-cancel', 'sm-close');
    setText('#shadowMindModal .sayit-btn-confirm', 'sm-open');

    setText('#miiaModal .sayit-modal-text', 'miia-desc');
    setList('#miiaModal .miia-feature span', MIIA_FEATURE_KEYS, true);
    setText('#miiaModal .sayit-btn-cancel', 'miia-close');
    setText('#miiaModal .sayit-btn-confirm', 'miia-download');

    // Divers : <html lang>, mémorisation, état des boutons, textes animés
    document.documentElement.lang = lang;
    try { localStorage.setItem('language', lang); } catch (e) {}
    document.querySelectorAll('.lang-option, .mobile-lang-btn').forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    if (typeof resetTypingEffect === 'function') resetTypingEffect();
}

// Branchement du sélecteur de langue (icône desktop + menu mobile)
function initLangSwitch() {
    const box = document.getElementById('langSwitch');
    const btn = document.getElementById('langSwitchBtn');

    if (box && btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const open = box.classList.toggle('open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('click', function () {
            box.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
        });
    }

    document.querySelectorAll('.lang-option, .mobile-lang-btn').forEach(function (b) {
        b.addEventListener('click', function (e) {
            e.stopPropagation();
            applyLanguage(b.getAttribute('data-lang'));
            if (box) box.classList.remove('open');
            const mm = document.getElementById('mobileMenu');
            const hb = document.getElementById('hamburger');
            if (mm) mm.classList.remove('open');
            if (hb) hb.classList.remove('open');
        });
    });

    applyLanguage(currentLanguage);
}