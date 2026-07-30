document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       Dark / Light Theme Toggle
       ========================================================================== */
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            // Determine if the current state resolves to dark mode
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

    /* ==========================================================================
       Clipboard Copy Functionality
       ========================================================================== */
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const targetSelector = button.getAttribute('data-clipboard-target');
            const codeElement = document.querySelector(targetSelector);
            const tooltip = button.querySelector('.copy-tooltip');
            
            if (!codeElement) return;
            
            const textToCopy = codeElement.textContent || codeElement.innerText;
            
            try {
                // Try modern Clipboard API
                await navigator.clipboard.writeText(textToCopy);
                handleCopySuccess(button, tooltip);
            } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'fixed'; // Avoid scrolling to bottom
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
                // Wait for the transition to finish before resetting text
                setTimeout(() => {
                    tooltip.textContent = 'Copy';
                }, 200);
            }
        }, 2000);
    }


    /* ==========================================================================
       Intersection Observer for Scroll Animations
       ========================================================================== */
    const animatableElements = document.querySelectorAll('.scroll-animate');
    
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Stop observing once animated in
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before element enters viewport
        });
        
        animatableElements.forEach(el => {
            animationObserver.observe(el);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        animatableElements.forEach(el => {
            el.classList.add('active');
        });
    }


    /* ==========================================================================
       Screenshot Lightbox / Modal Gallery
       ========================================================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    const galleryWrappers = document.querySelectorAll('.image-wrapper');
    
    if (lightbox && lightboxImg && lightboxCaption && galleryWrappers.length > 0) {
        
        // Open lightbox
        galleryWrappers.forEach(wrapper => {
            wrapper.addEventListener('click', () => {
                const img = wrapper.querySelector('.gallery-img');
                if (!img) return;
                
                // Set images and text
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightboxCaption.textContent = img.alt;
                
                // Show modal
                lightbox.classList.add('active');
                lightbox.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden'; // Disable page scrolling
                
                // Accessibility focus
                lightboxClose.focus();
            });
        });
        
        // Close lightbox function
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restore page scrolling
            
            // Clean content to avoid flashing old image on next click
            setTimeout(() => {
                lightboxImg.src = '';
                lightboxCaption.textContent = '';
            }, 300);
        };
        
        // Click on close button to close
        lightboxClose.addEventListener('click', closeLightbox);
        
        // Click on background overlay to close
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-wrapper')) {
                closeLightbox();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    /* ==========================================================================
       Mobile Navigation Menu Toggle
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            const isActive = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            
            // Toggle hamburger icon animation/state
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('.nav-item');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
});
