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
    
    // Empêcher le scroll de changer les sections
    let isNavigating = false;
    window.addEventListener('scroll', function() {
        if (isNavigating) return;
        // Ne rien faire - les sections sont contrôlées uniquement par la navigation
    });
});

// Navigation entre les sections
function showSection(sectionId) {
    // Masquer toutes les sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Afficher la section demandée
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
        // Scroll vers le haut de la page
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // Mettre à jour l'URL
    window.history.pushState(null, null, `#${sectionId}`);
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
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Animation de soumission
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simuler l'envoi
    setTimeout(() => {
    showNotification('Message sent successfully!', 'success');
        e.target.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-4 p-4 rounded-lg z-50 ${
        type === 'success' ? 'bg-green-600' : 'bg-blue-600'
    } text-white`;
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

// Animations au scroll - désactivées pour affichage immédiat
function initializeScrollAnimations() {
    // Désactivées
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
        'nav-home': 'Accueil',
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
        'nav-home': 'Home',
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