document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.innerHTML = `
        body {
            animation: fadeInPage 0.5s ease-out forwards;
        }
        body.page-exit {
            animation: fadeOutPage 0.4s ease-in forwards;
        }
        @keyframes fadeInPage {
            0% { opacity: 0; transform: translateY(15px) scale(0.99); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeOutPage {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-15px) scale(0.99); }
        }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const url = this.getAttribute('href');
            const target = this.getAttribute('target');
            
            // Allow default behavior for anchor links, external targets, mailto, etc.
            if (url && 
                !url.startsWith('#') && 
                !url.startsWith('mailto:') && 
                !url.startsWith('tel:') && 
                !url.startsWith('javascript:') && 
                target !== '_blank') {
                
                // Only intercept navigation to other pages or same domain
                e.preventDefault();
                document.body.classList.add('page-exit');
                setTimeout(() => {
                    window.location.href = url;
                }, 400); // 400ms matches the fadeOutPage animation duration
            }
        });
    });
});
