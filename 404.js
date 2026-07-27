/* ============================================
   VISIONAI - 404 PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. 404 PAGE INTERACTIVITY
    // ============================================

    /**
     * Add a fun easter egg to the 404 page
     * When you click the 404 number, it does a little animation
     */
    function initEasterEgg() {
        const codeElement = document.querySelector('.notfound-code');
        if (!codeElement) return;

        let clickCount = 0;
        const messages = [
            '🤔 Still lost?',
            '😄 You found me!',
            '🎯 Click again!',
            '✨ Magic!',
            '🚀 Whoosh!',
            '🎉 You win!'
        ];

        codeElement.addEventListener('click', function() {
            clickCount++;
            // Add a bounce animation
            this.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)';
            this.style.transform = 'scale(1.3)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);

            // Show a toast message after a few clicks
            if (clickCount >= 3 && clickCount <= 8) {
                const message = messages[Math.min(clickCount - 3, messages.length - 1)];
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info(message);
                }
            }

            // Reset counter after too many clicks
            if (clickCount > 10) {
                clickCount = 0;
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('🔄 Let\'s start over!');
                }
            }
        });

        // Add a subtle hover effect
        codeElement.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
            this.style.textShadow = '0 0 40px rgba(124, 58, 237, 0.3)';
        });

        codeElement.addEventListener('mouseleave', function() {
            this.style.textShadow = 'none';
        });

        console.log('404 easter egg initialized.');
    }

    // ============================================
    // 2. SUGGEST RANDOM LINKS
    // ============================================

    /**
     * Suggest a random page to visit from the 404 page
     */
    function initRandomSuggestion() {
        const suggestionContainer = document.querySelector('.notfound-suggestion');
        if (!suggestionContainer) return;

        const pages = [
            { name: 'Features', url: 'features.html' },
            { name: 'Pricing', url: 'pricing.html' },
            { name: 'Gallery', url: 'gallery.html' },
            { name: 'Templates', url: 'templates.html' },
            { name: 'AI Models', url: 'models.html' },
            { name: 'Blog', url: 'blog.html' },
            { name: 'Docs', url: 'docs.html' },
            { name: 'About', url: 'about.html' }
        ];

        const randomPage = pages[Math.floor(Math.random() * pages.length)];

        // Find or create suggestion element
        let suggestionEl = document.querySelector('.random-suggestion');
        if (!suggestionEl) {
            suggestionEl = document.createElement('p');
            suggestionEl.className = 'random-suggestion';
            suggestionEl.style.cssText = `
                    margin-top: 20px;
                    font-size: 0.9rem;
                    color: var(--text-muted);
                `;
            const p = document.querySelector('.notfound-content p');
            if (p && p.parentNode) {
                p.parentNode.insertBefore(suggestionEl, p.nextSibling);
            }
        }

        suggestionEl.innerHTML = `💡 Try visiting our <a href="${randomPage.url}" style="color:var(--primary);text-decoration:none;">${randomPage.name}</a> page`;

        console.log('Random suggestion initialized.');
    }

    // ============================================
    // 3. TRACK 404 ERRORS (analytics)
    // ============================================

    /**
     * Log 404 errors for analytics (privacy-friendly)
     */
    function log404Error() {
        const path = window.location.pathname;
        const referrer = document.referrer || 'direct';

        // Log to console for debugging
        console.log('[404 Error] Path:', path, 'Referrer:', referrer);

        // Send to analytics if available (Google Analytics, etc.)
        if (typeof gtag === 'function') {
            gtag('event', '404_error', {
                'page_path': path,
                'page_referrer': referrer
            });
        }

        // Also could send to a custom analytics endpoint here
        // We'll just log it for now

        // Show a helpful toast after a moment
        setTimeout(function() {
            if (window.VisionAI && window.VisionAI.Toast) {
                window.VisionAI.Toast.info('🔍 Looking for something? Try our search or navigation.');
            }
        }, 1500);
    }

    // ============================================
    // 4. SEARCH KEYBOARD SHORTCUT
    // ============================================

    /**
     * Add keyboard shortcut to go home (press 'H')
     */
    function initKeyboardShortcut() {
        document.addEventListener('keydown', function(e) {
            // Press 'H' to go home
            if (e.key === 'h' || e.key === 'H') {
                if (!e.ctrlKey && !e.metaKey && !e.altKey) {
                    e.preventDefault();
                    window.location.href = 'index.html';
                }
            }
            // Press '?' to show help
            if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('⌨️ Press H to go home, or click the 404 for fun!');
                }
            }
        });

        // Add a small indicator
        const footer = document.querySelector('.notfound-content');
        if (footer) {
            const shortcutHint = document.createElement('p');
            shortcutHint.style.cssText = `
                    margin-top: 16px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    opacity: 0.5;
                `;
            shortcutHint.textContent = '⌨️ Press H for home • Click the 404 for fun';
            footer.appendChild(shortcutHint);
        }
    }

    // ============================================
    // 5. EXPOSE PUBLIC API
    // ============================================

    window.NotFoundPage = {
        initEasterEgg: initEasterEgg,
        initSuggestion: initRandomSuggestion,
        logError: log404Error,
        initShortcut: initKeyboardShortcut,
        initAll: function() {
            initEasterEgg();
            initRandomSuggestion();
            log404Error();
            initKeyboardShortcut();
        }
    };

    // ============================================
    // 6. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    NotFoundPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                NotFoundPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('404 page module loaded.');

})();