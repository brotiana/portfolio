// ── Configuration EmailJS ─────────────────────────────────────────────
// Service = ton compte Gmail connecté dans EmailJS
const EMAILJS_SERVICE_ID  = 'service_3mmhbu8';
// Template ID : EmailJS → Email Templates → ouvre ton template → champ "Template ID"
// (il ressemble à "template_xxxxxxx")
const EMAILJS_TEMPLATE_ID = 'template_32bqdsb';
// Public key : EmailJS → Account → General → API Keys (clé PUBLIQUE uniquement)
const EMAILJS_PUBLIC_KEY  = 'zIWwtI3fiMRCD1iaY';
// Adresse qui reçoit les messages (à définir dans le template EmailJS)
const CONTACT_EMAIL       = 'gtiana337@gmail.com';

// Navigation et animations du portfolio
document.addEventListener('DOMContentLoaded', function() {
    // S'assurer que la section home s'affiche immédiatement
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.style.display = 'block';
        homeSection.style.opacity = '1';
        homeSection.style.transform = 'none';
    }

    // Masquer toutes les autres sections
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

    // Initialiser la langue puis l'effet de machine à écrire
    changeLanguage(currentLanguage);
    initializeTypingEffect();

    // Home icon → navigate to home
    const homeIconBtn = document.getElementById('homeIconBtn');
    if (homeIconBtn) {
        homeIconBtn.addEventListener('click', function() {
            showSection('home');
        });
    }

    // Empêcher le scroll de changer les sections
    let isNavigating = false;
    window.addEventListener('scroll', function() {
        if (isNavigating) return;
    });
});

// Navigation entre les sections
function showSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (!targetSection) return;

    const currentActive = document.querySelector('.section.active');

    // Ne rien faire si on est déjà sur la section
    if (currentActive && currentActive.id === sectionId) return;

    const displayNew = () => {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });

        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        targetSection.style.opacity = '0';
        window.scrollTo({ top: 0 });

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

    // Mettre à jour l'URL sans scroller nativement
    if (window.location.hash !== `#${sectionId}`) {
        window.history.pushState(null, null, `#${sectionId}`);
    }
}

// Animation des éléments de section (désactivé pour affichage immédiat)
function animateSectionElements(sectionId) {
    // Les animations sont désactivées pour un affichage immédiat
}

// Effet de machine à écrire
function initializeTypingEffect() {
    const getTypingTexts = () => {
        return [
            translations[currentLanguage]['hero-subtitle-1'],
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

// Réinitialiser l'effet de machine à écrire lors du changement de langue
function resetTypingEffect() {
    initializeTypingEffect();
}

// Initialiser les animations globales
function initializeAnimations() {
    // Animation des compétences au survol
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

// Menu mobile
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

// Gestion du formulaire de contact
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', handleContactSubmit);
    }
}

function handleContactSubmit(e) {
    e.preventDefault();

    const form = e.target;

    // Anti-spam : champ piège invisible (les robots le remplissent, pas les humains)
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

    // Vérifie que le SDK EmailJS est bien chargé
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

// Notifications
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

// Animations au scroll — IntersectionObserver reveal
function initializeScrollAnimations() {
    // CSS pour les éléments cachés avant apparition
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
                // Stagger delay based on index within its parent grid
                const parent = entry.target.parentElement;
                const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal-item'));
                const idx = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${idx * 80}ms`;
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // Tag and observe skill cards, project rows, capability cards
    function observeItems() {
        document.querySelectorAll('.skill-card, .project-row, #skills .grid > div:not(.skill-card)').forEach(el => {
            if (!el.classList.contains('reveal-item')) {
                el.classList.add('reveal-item');
                observer.observe(el);
            }
        });
    }

    // Run once now, and also after every section switch
    observeItems();
    const origShowSection = window._origShowSection || showSection;
    if (!window._origShowSection) {
        window._origShowSection = showSection;
    }
    // Re-tag new items whenever a section becomes visible
    const mutObs = new MutationObserver(() => {
        observeItems();
    });
    document.querySelectorAll('.section').forEach(s => {
        mutObs.observe(s, { attributes: true, attributeFilter: ['style', 'class'] });
    });
}

// Ouvrir un projet (placeholder)
function openProject(projectId) {
    showNotification(`Project ${projectId} - In development`, 'info');
}

// Gestion de l'historique du navigateur
window.addEventListener('popstate', function(e) {
    const hash = window.location.hash.substring(1);
    if (hash) {
        showSection(hash);
    } else {
        showSection('home');
    }
});

// Interception des clics sur les liens internes
document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
        const hash = anchor.getAttribute('href').substring(1);

        // Special case: "Bio" link → show home section, then scroll to bio panel
        if (hash === 'bio') {
            e.preventDefault();
            const homeSection = document.getElementById('home');
            const currentActive = document.querySelector('.section.active');

            if (currentActive && currentActive.id === 'home') {
                // Already on home, just scroll to bio
                const bioPanel = homeSection.querySelector('.relative.z-10');
                if (bioPanel) bioPanel.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Switch to home, then scroll to bio after animation
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

// Animation des particules flottantes (optionnel)
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

// Initialiser les particules si l'utilisateur le souhaite
// createFloatingParticles(); // Décommenter pour activer les particules

// Effet de parallax - désactivé

// Animation d'apparition pour les sections - désactivée

// Initialisation des tooltips pour les compétences
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

// Initialiser les tooltips
// initializeTooltips(); // Décommenter pour activer les tooltips

// Système de traduction
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
        'hero-subtitle-1': 'Fullstack Developer',
        'hero-subtitle-2': 'Web solutions creator',
        'hero-subtitle-3': 'Passionate about innovation',
        'hero-subtitle-4': 'Expert in modern technologies',
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

// Force default language to English (language selector removed)
let currentLanguage = 'en';

function changeLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);

    // Mettre à jour les boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`lang-${lang}`)?.classList.add('active');
    document.getElementById(`lang-${lang}-mobile`)?.classList.add('active');

    // Traduire tous les éléments
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Mettre à jour les textes complexes
    updateComplexTexts(lang);

    // Réinitialiser l'effet de machine à écrire
    resetTypingEffect();
}

function updateComplexTexts(lang) {
    // Hero title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle && translations[lang]['hero-title']) {
        heroTitle.textContent = translations[lang]['hero-title'];
    }

    // Hero description
    const heroDesc = document.querySelector('#home p.text-xl');
    if (heroDesc && translations[lang]['hero-description']) {
        heroDesc.textContent = translations[lang]['hero-description'];
    }

    // Section titles
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

// La langue est maintenant initialisée dans le DOMContentLoaded principal