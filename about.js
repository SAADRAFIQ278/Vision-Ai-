/* ============================================
   VISIONAI - ABOUT PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. TEAM CARD INTERACTIVITY
    // ============================================

    /**
     * Add interactive effects to team cards
     */
    function initTeamCards() {
        const teamCards = document.querySelectorAll('.team-card');
        if (teamCards.length === 0) return;

        teamCards.forEach(function(card) {
            // Add subtle tilt effect on hover (desktop only)
            card.addEventListener('mousemove', function(e) {
                if (window.innerWidth < 768) return;
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                this.style.transform =
                    'perspective(500px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });

            // Accessibility: focus states
            card.setAttribute('tabindex', '0');
            card.addEventListener('focusin', function() {
                this.style.outline = '2px solid var(--primary)';
                this.style.outlineOffset = '2px';
            });
            card.addEventListener('focusout', function() {
                this.style.outline = 'none';
            });
        });

        console.log('Team cards interactive enhancements applied.');
    }

    // ============================================
    // 2. VALUE CARDS INTERACTIVITY
    // ============================================

    function initValueCards() {
        const valueCards = document.querySelectorAll('.value-card');
        if (valueCards.length === 0) return;

        valueCards.forEach(function(card) {
            // Accessibility: focus states
            card.setAttribute('tabindex', '0');
            card.addEventListener('focusin', function() {
                this.style.outline = '2px solid var(--primary)';
                this.style.outlineOffset = '2px';
            });
            card.addEventListener('focusout', function() {
                this.style.outline = 'none';
            });

            // Add a subtle animation on click
            card.addEventListener('click', function() {
                this.style.transition = 'transform 0.15s ease';
                this.style.transform = 'scale(0.98)';
                setTimeout(function() {
                    this.style.transform = '';
                }.bind(this), 150);
            });
        });
    }

    // ============================================
    // 3. STATS COUNTER ANIMATION
    // ============================================

    function initStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-box .stat-number');
        if (statNumbers.length === 0) return;

        let animated = false;

        function animateStats() {
            if (animated) return;
            animated = true;

            statNumbers.forEach(function(stat) {
                const target = parseFloat(stat.getAttribute('data-count')) || 0;
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = eased * target;

                    if (isDecimal) {
                        stat.textContent = current.toFixed(1);
                    } else {
                        stat.textContent = Math.floor(current);
                    }

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        if (isDecimal) {
                            stat.textContent = target.toFixed(1);
                        } else {
                            stat.textContent = target;
                        }
                        // Add a small pop effect
                        stat.classList.add('counter-pop');
                        setTimeout(function() {
                            stat.classList.remove('counter-pop');
                        }, 500);
                    }
                }
                requestAnimationFrame(updateCounter);
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

        const statsContainer = document.querySelector('.about-stats .stats-grid');
        if (statsContainer) {
            observer.observe(statsContainer);
        } else if (statNumbers.length > 0) {
            observer.observe(statNumbers[0].closest('.stat-box'));
        }
    }

    // ============================================
    // 4. SMOOTH SCROLL TO TEAM (from anchor links)
    // ============================================

    function initTeamScroll() {
        const links = document.querySelectorAll('a[href="#team"]');
        if (links.length === 0) return;

        links.forEach(function(link) {
            link.addEventListener('click', function(e) {
                const target = document.querySelector('.about-team');
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
            });
        });
    }

    // ============================================
    // 5. EXPOSE PUBLIC API
    // ============================================

    window.AboutPage = {
        initTeam: initTeamCards,
        initValues: initValueCards,
        initStats: initStatsCounter,
        initScroll: initTeamScroll,
        initAll: function() {
            initTeamCards();
            initValueCards();
            initStatsCounter();
            initTeamScroll();
        }
    };

    // ============================================
    // 6. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    AboutPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                AboutPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('About page module loaded.');

})();