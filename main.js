

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


    changeLanguage(currentLanguage);
    initializeTypingEffect();


    const homeIconBtn = document.getElementById('homeIconBtn');
    if (homeIconBtn) {
        homeIconBtn.addEventListener('click', function () {
            // L'icône Accueil = toujours revenir sur le hero (haut de #home).
            // Quand on est déjà sur l'accueil (ex. panneau Bio), showSection('home')
            // ne fait rien (même section) : il faut remonter le défilement de #home.
            sectionScrollMemory['home'] = 0;
            const currentActive = document.querySelector('.section.active');
            if (currentActive && currentActive.id === 'home') {
                const home = document.getElementById('home');
                if (home) {
                    // On neutralise le scroll-snap pendant la remontée : sinon il
                    // vise un point d'ancrage intermédiaire (le hero est sticky
                    // avec top:-25vh) et laisse le panneau Bio encore ~75% visible.
                    const snap = home.style.scrollSnapType;
                    home.style.scrollSnapType = 'none';
                    home.scrollTo({ top: 0, behavior: 'smooth' });
                    window.setTimeout(function () {
                        home.scrollTop = 0;
                        home.style.scrollSnapType = snap;
                    }, 600);
                }
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


function initializeTypingEffect() {
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
        const currentText = texts[textIndex];
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

        setTimeout(typeText, typeSpeed);
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





const translations = {
    fr: {
        'nav-bio': 'Bio',
        'nav-skills': 'Compétences',
        'nav-projects': 'Projets',
        'nav-contact': 'Contact',
        'hero-title': 'Développeur Fullstack',
        'hero-subtitle-2': 'Créateur de solutions web',
        'hero-subtitle-3': 'Passionné par l\'innovation',
        'hero-subtitle-4': 'Expert en technologies modernes',
        'hero-description': 'Passionné par la création d\'applications web innovantes et performantes. Je transforme des idées en solutions concrètes avec des technologies modernes.',
        'hero-projects-btn': 'Voir mes projets',
        'hero-contact-btn': 'Me contacter',
        'skills-title': 'Mes Compétences',
        'projects-title': 'Mes Projets',
        'contact-title': 'Me Contacter',
        'contact-info-title': 'Informations de contact',
        'contact-social-title': 'Réseaux sociaux',
        'form-name': 'Votre nom',
        'form-email': 'Votre email',
        'form-subject': 'Sujet',
        'form-message': 'Votre message',
        'form-submit': 'Envoyer le message'
    },
    en: {
        'nav-bio': 'Bio',
        'nav-skills': 'Skills',
        'nav-projects': 'Projects',
        'nav-contact': 'Contact',
        'hero-title': 'Fullstack Developer',
        'hero-subtitle-2': 'Web solutions creator',
        'hero-subtitle-3': 'Passionate about innovation',
        'hero-subtitle-4': 'Automation Expert',
        'hero-description': 'Passionate about creating innovative and performant web applications. I transform ideas into concrete solutions with modern technologies.',
        'hero-projects-btn': 'View my projects',
        'hero-contact-btn': 'Contact me',
        'skills-title': 'My Skills',
        'projects-title': 'My Projects',
        'contact-title': 'Contact Me',
        'contact-info-title': 'Contact information',
        'contact-social-title': 'Social networks',
        'form-name': 'Your name',
        'form-email': 'Your email',
        'form-subject': 'Subject',
        'form-message': 'Your message',
        'form-submit': 'Send message'
    }
};


let currentLanguage = 'en';

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);


    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`)?.classList.add('active');
    document.getElementById(`lang-${lang}-mobile`)?.classList.add('active');


    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });


    updateComplexTexts(lang);


    resetTypingEffect();
}

function updateComplexTexts(lang) {

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && translations[lang]['hero-title']) {
        heroTitle.textContent = translations[lang]['hero-title'];
    }


    const heroDesc = document.querySelector('#home p.text-xl');
    if (heroDesc && translations[lang]['hero-description']) {
        heroDesc.textContent = translations[lang]['hero-description'];
    }


    const skillsTitle = document.querySelector('#skills h2');
    if (skillsTitle && translations[lang]['skills-title']) {
        skillsTitle.textContent = translations[lang]['skills-title'];
    }

    const projectsTitle = document.querySelector('#projects h2');
    if (projectsTitle && translations[lang]['projects-title']) {
        projectsTitle.textContent = translations[lang]['projects-title'];
    }

    const contactTitle = document.querySelector('#contact h2');
    if (contactTitle && translations[lang]['contact-title']) {
        contactTitle.textContent = translations[lang]['contact-title'];
    }
}

