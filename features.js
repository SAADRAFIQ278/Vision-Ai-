/* ============================================
   VISIONAI - FEATURES PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. FEATURE CARD INTERACTIVITY
    // ============================================

    /**
     * Add interactive hover effects to feature cards
     * This enhances the CSS hover with additional JS effects
     */
    function initFeatureCards() {
        const cards = document.querySelectorAll('.feature-detail-card');
        if (cards.length === 0) return;

        cards.forEach(function(card) {
            // Add mouse enter/leave events for additional effects
            card.addEventListener('mouseenter', function() {
                // Add a subtle glow effect via data attribute
                this.dataset.hover = 'true';
            });

            card.addEventListener('mouseleave', function() {
                this.dataset.hover = 'false';
            });

            // Accessibility: focus effect for keyboard navigation
            card.addEventListener('focusin', function() {
                this.style.outline = '2px solid var(--primary)';
                this.style.outlineOffset = '2px';
            });

            card.addEventListener('focusout', function() {
                this.style.outline = 'none';
            });
        });

        console.log('Feature cards interactive enhancements applied.');
    }

    // ============================================
    // 2. FEATURE FILTER (Optional)
    // ============================================

    /**
     * If we want to add category filtering to features
     * Currently just a placeholder for future expansion
     */
    function initFeatureFilter() {
        const filterContainer = document.querySelector('.features-filter');
        if (!filterContainer) return;

        const buttons = filterContainer.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.feature-detail-card');

        if (buttons.length === 0 || cards.length === 0) return;

        buttons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                buttons.forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');

                const filter = this.dataset.filter || 'all';

                cards.forEach(function(card) {
                    const categories = (card.dataset.categories || 'all').split(' ');
                    const shouldShow = filter === 'all' || categories.includes(filter);

                    if (shouldShow) {
                        card.style.display = '';
                        // Re-trigger reveal animation
                        if (!card.classList.contains('revealed')) {
                            card.classList.add('revealed');
                        }
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });

        console.log('Feature filter initialized.');
    }

    // ============================================
    // 3. FEATURE COUNTER (Stats animation)
    // ============================================

    /**
     * Animate feature stats if present on the page
     */
    function initFeatureStats() {
        const stats = document.querySelectorAll('.feature-stat-number');
        if (stats.length === 0) return;

        let animated = false;

        function animateStats() {
            if (animated) return;
            animated = true;

            stats.forEach(function(stat) {
                const target = parseInt(stat.getAttribute('data-count')) || 0;
                const duration = 1500;
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = Math.floor(eased * target);

                    stat.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        stat.textContent = target;
                    }
                }
                requestAnimationFrame(update);
            });
        }

        // Use Intersection Observer
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !animated) {
                    animateStats();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        const container = stats[0].closest('.feature-stats-container');
        if (container) {
            observer.observe(container);
        } else {
            observer.observe(stats[0]);
        }

        console.log('Feature stats animation initialized.');
    }

    // ============================================
    // 4. SMOOTH SCROLL TO FEATURE (from anchor links)
    // ============================================

    function initFeatureScroll() {
        const links = document.querySelectorAll('a[href^="#feature-"]');
        if (links.length === 0) return;

        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();

                const navbarHeight = document.querySelector('#navbar') ?
                    document.querySelector('#navbar').offsetHeight : 80;

                const offsetTop = target.getBoundingClientRect().top +
                    window.pageYOffset - navbarHeight - 20;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Highlight the target card briefly
                target.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
                target.style.boxShadow = '0 0 0 4px var(--primary), 0 8px 32px rgba(124, 58, 237, 0.3)';
                target.style.borderColor = 'var(--primary)';

                setTimeout(function() {
                    target.style.boxShadow = '';
                    target.style.borderColor = '';
                }, 2000);
            });
        });

        console.log('Feature scroll navigation initialized.');
    }

    // ============================================
    // 5. EXPOSE PUBLIC API
    // ============================================

    window.FeaturesPage = {
        initCards: initFeatureCards,
        initFilter: initFeatureFilter,
        initStats: initFeatureStats,
        initScroll: initFeatureScroll,
        initAll: function() {
            initFeatureCards();
            initFeatureFilter();
            initFeatureStats();
            initFeatureScroll();
        }
    };

    // ============================================
    // 6. INITIALIZE
    // ============================================

    function init() {
        // Wait for DOM ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    FeaturesPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                FeaturesPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('Features page module loaded.');

})();