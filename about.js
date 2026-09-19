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
                const rotateX = (y - centerY) / 24;
                const rotateY = (centerX - x) / 24;
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

            // Click on card to show a toast with team member info
            card.addEventListener('click', function() {
                const name = this.querySelector('.team-name')?.textContent || 'Team member';
                const role = this.querySelector('.team-role')?.textContent || '';
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('👤 ' + name + ' — ' + role);
                }
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
                this.style.transform = 'scale(0.97)';
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

        // Fallback: start after 3 seconds if not triggered
        setTimeout(function() {
            if (!animated) {
                animateStats();
            }
        }, 4000);
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
    // 5. STORY IMAGE INTERACTIVITY
    // ============================================

    function initStoryImage() {
        const storyImage = document.querySelector('.story-image');
        if (!storyImage) return;

        // Add a zoom effect on click
        storyImage.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (!img) return;

            // Create a lightbox effect for the story image
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                    position: fixed;
                    inset: 0;
                    z-index: 999;
                    background: rgba(6, 8, 22, 0.92);
                    backdrop-filter: blur(20px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.4s ease;
                `;

            const imgClone = img.cloneNode();
            imgClone.style.cssText = `
                    max-width: 90vw;
                    max-height: 85vh;
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    transform: scale(0.9);
                    transition: transform 0.4s ease;
                `;

            overlay.appendChild(imgClone);
            document.body.appendChild(overlay);

            // Trigger animation
            requestAnimationFrame(function() {
                overlay.style.opacity = '1';
                imgClone.style.transform = 'scale(1)';
            });

            // Close on click
            overlay.addEventListener('click', function() {
                overlay.style.opacity = '0';
                imgClone.style.transform = 'scale(0.9)';
                setTimeout(function() {
                    overlay.remove();
                    document.body.style.overflow = '';
                }, 400);
            });

            // Close on Escape
            const keyHandler = function(e) {
                if (e.key === 'Escape') {
                    overlay.click();
                    document.removeEventListener('keydown', keyHandler);
                }
            };
            document.addEventListener('keydown', keyHandler);

            document.body.style.overflow = 'hidden';
        });

        // Add cursor pointer
        storyImage.style.cursor = 'pointer';

        // Add a tooltip
        const tooltip = document.createElement('span');
        tooltip.textContent = '🖼️ Click to enlarge';
        tooltip.style.cssText = `
                position: absolute;
                bottom: 60px;
                right: 20px;
                font-size: 0.7rem;
                color: var(--text-muted);
                background: rgba(6, 8, 22, 0.7);
                backdrop-filter: blur(4px);
                padding: 4px 12px;
                border-radius: var(--radius-full);
                opacity: 0;
                transition: opacity var(--transition-base);
                pointer-events: none;
            `;
        storyImage.appendChild(tooltip);

        storyImage.addEventListener('mouseenter', function() {
            tooltip.style.opacity = '1';
        });

        storyImage.addEventListener('mouseleave', function() {
            tooltip.style.opacity = '0';
        });
    }

    // ============================================
    // 6. KEYBOARD SHORTCUTS
    // ============================================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Press 'T' to jump to team section
            if (e.key === 't' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const teamSection = document.querySelector('.about-team');
                if (teamSection) {
                    e.preventDefault();
                    const navbarHeight = document.querySelector('#navbar')?.offsetHeight || 80;
                    const offsetTop = teamSection.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });

                    if (window.VisionAI && window.VisionAI.Toast) {
                        window.VisionAI.Toast.info('👥 Scrolling to Team section');
                    }
                }
            }

            // Press 'S' to jump to story section
            if (e.key === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const storySection = document.querySelector('.about-story');
                if (storySection) {
                    e.preventDefault();
                    const navbarHeight = document.querySelector('#navbar')?.offsetHeight || 80;
                    const offsetTop = storySection.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });

                    if (window.VisionAI && window.VisionAI.Toast) {
                        window.VisionAI.Toast.info('📖 Scrolling to Our Story');
                    }
                }
            }
        });
    }

    // ============================================
    // 7. EXPOSE PUBLIC API
    // ============================================

    window.AboutPage = {
        initTeam: initTeamCards,
        initValues: initValueCards,
        initStats: initStatsCounter,
        initScroll: initTeamScroll,
        initStory: initStoryImage,
        initShortcuts: initKeyboardShortcuts,
        initAll: function() {
            initTeamCards();
            initValueCards();
            initStatsCounter();
            initTeamScroll();
            initStoryImage();
            initKeyboardShortcuts();
        }
    };

    // ============================================
    // 8. INITIALIZE
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