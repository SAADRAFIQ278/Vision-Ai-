/* ============================================
   VISIONAI - MODELS PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. MODEL CARD INTERACTIVITY
    // ============================================

    /**
     * Add interactive effects to model cards
     */
    function initModelCards() {
        const cards = document.querySelectorAll('.model-card');
        if (cards.length === 0) return;

        cards.forEach(function(card) {
            // Add 3D tilt effect on hover (desktop only)
            card.addEventListener('mousemove', function(e) {
                if (window.innerWidth < 768) return;
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 12;
                const rotateY = (centerX - x) / 12;
                this.style.transform =
                    'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });

            // Accessibility: focus states
            card.addEventListener('focusin', function() {
                this.style.outline = '2px solid var(--primary)';
                this.style.outlineOffset = '2px';
            });

            card.addEventListener('focusout', function() {
                this.style.outline = 'none';
            });
        });

        console.log('Model cards interactive enhancements applied.');
    }

    // ============================================
    // 2. COMPARISON TABLE INTERACTIVITY
    // ============================================

    /**
     * Highlight rows on hover and add sticky header support
     */
    function initComparisonTable() {
        const table = document.querySelector('.model-comparison-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(function(row) {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(124, 58, 237, 0.06)';
            });
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });

        // Add a "sticky" class to thead when scrolling
        const tableWrapper = table.closest('.comparison-scroll');
        if (tableWrapper) {
            tableWrapper.addEventListener('scroll', function() {
                const thead = table.querySelector('thead');
                if (this.scrollTop > 0) {
                    thead.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
                } else {
                    thead.style.boxShadow = 'none';
                }
            });
        }

        console.log('Comparison table initialized.');
    }

    // ============================================
    // 3. MODEL FILTER (if category filter is added)
    // ============================================

    function initModelFilter() {
        const filterBtns = document.querySelectorAll('.model-filter-btn');
        const modelCards = document.querySelectorAll('.model-card');

        if (filterBtns.length === 0 || modelCards.length === 0) return;

        filterBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                filterBtns.forEach(function(b) {
                    b.classList.remove('active');
                });
                this.classList.add('active');

                const filter = this.dataset.filter || 'all';

                modelCards.forEach(function(card) {
                    const category = card.dataset.category || 'all';
                    if (filter === 'all' || category === filter) {
                        card.style.display = '';
                        setTimeout(function() {
                            card.style.opacity = '1';
                            card.style.transform = '';
                        }, 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.95)';
                        setTimeout(function() {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });

        console.log('Model filter initialized.');
    }

    // ============================================
    // 4. SPEC TOOLTIP (for specs)
    // ============================================

    function initSpecTooltips() {
        const specItems = document.querySelectorAll('.spec-item');
        specItems.forEach(function(item) {
            const value = item.querySelector('.spec-value');
            if (!value) return;

            // If the spec value has a tooltip data attribute
            const tooltipText = value.dataset.tooltip;
            if (tooltipText) {
                item.style.position = 'relative';
                item.style.cursor = 'help';

                item.addEventListener('mouseenter', function() {
                    const tooltip = document.createElement('div');
                    tooltip.className = 'spec-tooltip';
                    tooltip.textContent = tooltipText;
                    tooltip.style.cssText = `
                            position: absolute;
                            bottom: calc(100% + 8px);
                            left: 50%;
                            transform: translateX(-50%);
                            background: var(--bg-surface);
                            color: var(--text-white);
                            padding: 8px 14px;
                            border-radius: var(--radius-sm);
                            font-size: 0.75rem;
                            white-space: nowrap;
                            border: 1px solid var(--border-light);
                            box-shadow: var(--shadow-md);
                            z-index: 100;
                            pointer-events: none;
                        `;
                    this.appendChild(tooltip);
                });

                item.addEventListener('mouseleave', function() {
                    const tooltip = this.querySelector('.spec-tooltip');
                    if (tooltip) tooltip.remove();
                });
            }
        });
    }

    // ============================================
    // 5. MODEL COMPARISON TOGGLE (mobile view)
    // ============================================

    function initComparisonToggle() {
        const toggleBtn = document.querySelector('.comparison-toggle');
        const comparisonWrapper = document.querySelector('.comparison-wrapper');

        if (!toggleBtn || !comparisonWrapper) return;

        toggleBtn.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
            this.setAttribute('aria-expanded', isExpanded);
            comparisonWrapper.classList.toggle('expanded');

            if (isExpanded) {
                this.textContent = 'Hide Full Comparison ▲';
            } else {
                this.textContent = 'Show Full Comparison ▼';
            }
        });
    }

    // ============================================
    // 6. ANIMATE MODEL STATS (if present)
    // ============================================

    function initModelStats() {
        const stats = document.querySelectorAll('.model-stat-number');
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

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !animated) {
                    animateStats();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        const container = stats[0].closest('.models-stats-container');
        if (container) {
            observer.observe(container);
        } else {
            observer.observe(stats[0]);
        }
    }

    // ============================================
    // 7. SMOOTH SCROLL TO MODEL (from anchor links)
    // ============================================

    function initModelScroll() {
        const links = document.querySelectorAll('a[href^="#model-"]');
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
    }

    // ============================================
    // 8. EXPOSE PUBLIC API
    // ============================================

    window.ModelsPage = {
        initCards: initModelCards,
        initTable: initComparisonTable,
        initFilter: initModelFilter,
        initTooltips: initSpecTooltips,
        initToggle: initComparisonToggle,
        initStats: initModelStats,
        initScroll: initModelScroll,
        initAll: function() {
            initModelCards();
            initComparisonTable();
            initModelFilter();
            initSpecTooltips();
            initComparisonToggle();
            initModelStats();
            initModelScroll();
        }
    };

    // ============================================
    // 9. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    ModelsPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                ModelsPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('Models page module loaded.');

})();