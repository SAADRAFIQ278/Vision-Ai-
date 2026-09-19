/* ============================================
   VISIONAI - FAQ PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. DOM REFERENCES
    // ============================================

    const categoryBtns = document.querySelectorAll('.faq-cat-btn');
    const categoryGroups = document.querySelectorAll('.faq-category-group');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqContactBox = document.querySelector('.faq-contact-box');

    // ============================================
    // 2. FAQ CATEGORY FILTER
    // ============================================

    let activeCategory = 'all';

    /**
     * Filter FAQ items by category
     */
    function filterFAQ(category) {
        activeCategory = category;

        // Update active button
        categoryBtns.forEach(function(btn) {
            const isActive = btn.dataset.category === category;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Show/hide category groups
        categoryGroups.forEach(function(group) {
            const groupCategory = group.dataset.category || 'all';
            const shouldShow = category === 'all' || groupCategory === category;

            if (shouldShow) {
                group.classList.remove('hidden');
                // Animate items in
                const items = group.querySelectorAll('.faq-item');
                items.forEach(function(item, index) {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(15px)';
                    setTimeout(function() {
                        item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, index * 80);
                });
            } else {
                group.classList.add('hidden');
            }
        });

        // Update URL hash for sharing
        if (history.pushState) {
            const url = new URL(window.location);
            if (category !== 'all') {
                url.searchParams.set('category', category);
            } else {
                url.searchParams.delete('category');
            }
            history.pushState({ category: category }, '', url);
        }

        // Dispatch event
        document.dispatchEvent(new CustomEvent('faq-filtered', {
            detail: { category: category }
        }));
    }

    // ============================================
    // 3. FAQ ACCORDION
    // ============================================

    /**
     * Initialize FAQ accordion with smooth animation
     */
    function initAccordion() {
        if (faqItems.length === 0) return;

        faqItems.forEach(function(item) {
            const question = item.querySelector('.faq-question');
            if (!question) return;

            question.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;

                // Close other items in the same category group
                const parentGroup = this.closest('.faq-category-group');
                if (parentGroup) {
                    const siblings = parentGroup.querySelectorAll('.faq-item');
                    siblings.forEach(function(sibling) {
                        const siblingQuestion = sibling.querySelector('.faq-question');
                        if (siblingQuestion && siblingQuestion !== question) {
                            siblingQuestion.setAttribute('aria-expanded', 'false');
                        }
                    });
                }

                this.setAttribute('aria-expanded', expanded);

                // Dispatch event
                document.dispatchEvent(new CustomEvent('faq-toggle', {
                    detail: {
                        question: this.querySelector('span')?.textContent || '',
                        expanded: expanded
                    }
                }));
            });

            // Keyboard support
            question.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });

        console.log('FAQ accordion initialized with', faqItems.length, 'items.');
    }

    // ============================================
    // 4. FAQ SEARCH
    // ============================================

    function initFAQSearch() {
        const searchInput = document.querySelector('.faq-search-input');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim().toLowerCase();

            searchTimeout = setTimeout(function() {
                // Reset all categories first
                categoryGroups.forEach(function(group) {
                    group.classList.remove('hidden');
                });

                let visibleCount = 0;

                faqItems.forEach(function(item) {
                    const question = item.querySelector('.faq-question span')?.textContent?.toLowerCase() || '';
                    const answer = item.querySelector('.faq-answer p')?.textContent?.toLowerCase() || '';
                    const matches = !query || question.includes(query) || answer.includes(query);

                    if (matches) {
                        item.style.display = '';
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                        visibleCount++;
                    } else {
                        item.style.display = 'none';
                        item.style.opacity = '0';
                        item.style.transform = 'translateY(10px)';
                    }
                });

                // Hide empty category groups
                categoryGroups.forEach(function(group) {
                    const visibleItems = group.querySelectorAll('.faq-item[style*="display: none"]');
                    const allItems = group.querySelectorAll('.faq-item');
                    if (visibleItems.length === allItems.length && allItems.length > 0) {
                        group.classList.add('hidden');
                    } else {
                        group.classList.remove('hidden');
                    }
                });

                // Show/hide no results message
                let noResults = document.querySelector('.faq-no-results');
                if (visibleCount === 0 && query) {
                    if (!noResults) {
                        noResults = document.createElement('div');
                        noResults.className = 'faq-no-results';
                        noResults.style.cssText = `
                            text-align: center;
                            padding: 60px 20px;
                            color: var(--text-paragraph);
                            grid-column: 1 / -1;
                        `;
                        noResults.innerHTML = `
                            <span style="font-size:3rem;display:block;margin-bottom:12px;">🔍</span>
                            <p style="font-size:1.1rem;color:var(--text-white);">No results found</p>
                            <p style="font-size:0.9rem;">Try adjusting your search terms</p>
                        `;
                        const grid = document.querySelector('.faq-page-grid');
                        if (grid) grid.appendChild(noResults);
                    }
                    noResults.style.display = 'block';
                } else {
                    if (noResults) {
                        noResults.style.display = 'none';
                    }
                }

                // Update category tabs (select 'all' when searching)
                if (query) {
                    categoryBtns.forEach(function(btn) {
                        btn.classList.remove('active');
                        btn.setAttribute('aria-selected', 'false');
                        if (btn.dataset.category === 'all') {
                            btn.classList.add('active');
                            btn.setAttribute('aria-selected', 'true');
                        }
                    });
                }

            }, 300);
        });

        console.log('FAQ search initialized.');
    }

    // ============================================
    // 5. ANIMATE FAQ ITEMS ON SCROLL
    // ============================================

    function initFAQReveal() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const item = entry.target;
                        if (!item.classList.contains('revealed')) {
                            item.classList.add('revealed');
                        }
                        observer.unobserve(item);
                    }
                });
            }, { threshold: 0.1, rootMargin: '50px' });

            faqItems.forEach(function(item) {
                observer.observe(item);
            });
        }
    }

    // ============================================
    // 6. KEYBOARD SHORTCUTS
    // ============================================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Press 'F' to focus search
            if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const searchInput = document.querySelector('.faq-search-input');
                if (searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                    if (window.VisionAI && window.VisionAI.Toast) {
                        window.VisionAI.Toast.info('🔍 Search focused');
                    }
                }
            }

            // Press 'C' to cycle categories
            if ((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const categories = Array.from(categoryBtns).map(function(btn) {
                    return btn.dataset.category;
                });
                const currentIndex = categories.indexOf(activeCategory);
                const nextIndex = (currentIndex + 1) % categories.length;
                const nextCategory = categories[nextIndex];
                if (nextCategory) {
                    const btn = document.querySelector('.faq-cat-btn[data-category="' + nextCategory + '"]');
                    if (btn) {
                        e.preventDefault();
                        btn.click();
                        if (window.VisionAI && window.VisionAI.Toast) {
                            window.VisionAI.Toast.info('📂 Category: ' + nextCategory);
                        }
                    }
                }
            }
        });
    }

    // ============================================
    // 7. EXPAND FAQ FROM URL HASH
    // ============================================

    function initHashNavigation() {
        // Check if URL has a hash pointing to a specific FAQ
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target && target.classList.contains('faq-item')) {
                setTimeout(function() {
                    const question = target.querySelector('.faq-question');
                    if (question) {
                        question.setAttribute('aria-expanded', 'true');
                        const navbarHeight = document.querySelector('#navbar')?.offsetHeight || 80;
                        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                        window.scrollTo({ top: offsetTop, behavior: 'smooth' });

                        // Highlight the item briefly
                        target.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
                        target.style.boxShadow = '0 0 0 4px var(--primary), 0 8px 32px rgba(124, 58, 237, 0.3)';
                        target.style.borderColor = 'var(--primary)';
                        setTimeout(function() {
                            target.style.boxShadow = '';
                            target.style.borderColor = '';
                        }, 2500);
                    }
                }, 300);
            }
        }

        // Handle hash changes
        window.addEventListener('hashchange', function() {
            const target = document.querySelector(window.location.hash);
            if (target && target.classList.contains('faq-item')) {
                const question = target.querySelector('.faq-question');
                if (question) {
                    question.setAttribute('aria-expanded', 'true');
                }
            }
        });
    }

    // ============================================
    // 8. EXPOSE PUBLIC API
    // ============================================

    window.FAQPage = {
        filter: filterFAQ,
        initAccordion: initAccordion,
        initSearch: initFAQSearch,
        initReveal: initFAQReveal,
        initShortcuts: initKeyboardShortcuts,
        initHash: initHashNavigation,
        initAll: function() {
            initAccordion();
            initFAQSearch();
            initFAQReveal();
            initKeyboardShortcuts();
            initHashNavigation();

            // Check URL params for initial category filter
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            if (category) {
                const btn = document.querySelector('.faq-cat-btn[data-category="' + category + '"]');
                if (btn) {
                    btn.click();
                }
            }

            console.log('FAQ page initialized.');
        }
    };

    // ============================================
    // 9. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    FAQPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                FAQPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('FAQ page module loaded.');

})();