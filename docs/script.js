document.addEventListener('DOMContentLoaded', () => {

    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isCurrentlyDark = document.documentElement.classList.contains('dark') || 
                (!document.documentElement.classList.contains('light') && window.matchMedia('(prefers-color-scheme: dark)').matches);
                
            if (isCurrentlyDark) {
                document.documentElement.classList.remove('dark');
                document.documentElement.classList.add('light');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.remove('light');
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetSelector = button.getAttribute('data-clipboard-target');
            const codeElement = document.querySelector(targetSelector);
            const tooltip = button.querySelector('.copy-tooltip');
            
            if (!codeElement) return;
            
            const textToCopy = codeElement.textContent || codeElement.innerText;
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                handleCopySuccess(button, tooltip);
            } catch (err) {
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    document.execCommand('copy');
                    handleCopySuccess(button, tooltip);
                } catch (fallbackErr) {
                    console.error('Failed to copy text: ', fallbackErr);
                    if (tooltip) tooltip.textContent = 'Failed to copy';
                }
                
                document.body.removeChild(textArea);
            }
        });
    });

    function handleCopySuccess(button, tooltip) {
        button.classList.add('copied');
        if (tooltip) {
            tooltip.textContent = 'Copied!';
        }
        
        setTimeout(() => {
            button.classList.remove('copied');
            if (tooltip) {
                setTimeout(() => {
                    tooltip.textContent = 'Copy';
                }, 200);
            }
        }, 2000);
    }

    const animatableElements = document.querySelectorAll('.scroll-animate');
    
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatableElements.forEach(el => {
            animationObserver.observe(el);
        });
    } else {
        animatableElements.forEach(el => {
            el.classList.add('active');
        });
    }

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const galleryWrappers = document.querySelectorAll('.image-wrapper');
    
    if (lightbox && lightboxImg && lightboxCaption && galleryWrappers.length > 0) {
        
        galleryWrappers.forEach(wrapper => {
            wrapper.addEventListener('click', () => {
                const img = wrapper.querySelector('.gallery-img');
                if (!img) return;
                
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightboxCaption.textContent = img.alt;
                
                lightbox.classList.add('active');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                
                lightboxClose.focus();
            });
        });
        
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            
            setTimeout(() => {
                lightboxImg.src = '';
                lightboxCaption.textContent = '';
            }, 300);
        };
        
        lightboxClose.addEventListener('click', closeLightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-wrapper')) {
                closeLightbox();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            const isActive = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            
            menuToggle.classList.toggle('active');
        });

        const navLinks = navMenu.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
});
