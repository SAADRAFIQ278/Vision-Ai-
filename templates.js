/* ============================================
   VISIONAI - TEMPLATES PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. DOM REFERENCES
    // ============================================

    const templatesGrid = document.getElementById('templatesGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const templateCards = document.querySelectorAll('.template-full-card');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const previewBtns = document.querySelectorAll('.preview-btn');

    // ============================================
    // 2. TEMPLATE FILTER
    // ============================================

    let activeFilter = 'all';
    let visibleCount = 6;
    const initialVisible = 6;
    const loadIncrement = 3;

    /**
     * Filter templates by category
     */
    function filterTemplates(category) {
        activeFilter = category;

        // Update active button
        filterBtns.forEach(function(btn) {
            const isActive = btn.dataset.filter === category;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Show/hide cards based on category
        let visibleCards = [];
        templateCards.forEach(function(card, index) {
            const cardCategory = card.dataset.category || 'all';
            const shouldShow = category === 'all' || cardCategory === category;

            if (shouldShow) {
                visibleCards.push(card);
                card.style.display = '';
                // Reset position for animation
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = '';
            }
        });

        // Reset visible count and show initial cards with animation
        visibleCount = Math.min(initialVisible, visibleCards.length);
        showVisibleCards(visibleCards);

        // Update load more button state
        updateLoadMoreButton(visibleCards.length);

        // Dispatch event
        document.dispatchEvent(new CustomEvent('templates-filtered', {
            detail: { category: category, total: visibleCards.length }
        }));
    }

    /**
     * Show visible cards with staggered animation
     */
    function showVisibleCards(cards) {
        const visible = cards.slice(0, visibleCount);
        const hidden = cards.slice(visibleCount);

        // Show visible cards with stagger
        visible.forEach(function(card, index) {
            card.style.display = '';
            setTimeout(function() {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }, index * 80);
        });

        // Hide remaining cards
        hidden.forEach(function(card) {
            card.style.display = 'none';
            card.style.opacity = '0';
            card.style.transform = '';
        });
    }

    /**
     * Update load more button state
     */
    function updateLoadMoreButton(totalCards) {
        if (!loadMoreBtn) return;

        if (visibleCount >= totalCards) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
            const remaining = totalCards - visibleCount;
            loadMoreBtn.textContent = 'Load ' + Math.min(loadIncrement, remaining) + ' More Templates';
        }
    }

    /**
     * Load more templates
     */
    function loadMoreTemplates() {
        const allCards = Array.from(templateCards).filter(function(card) {
            const category = card.dataset.category || 'all';
            return activeFilter === 'all' || category === activeFilter;
        });

        const remaining = allCards.length - visibleCount;
        const toLoad = Math.min(loadIncrement, remaining);

        if (toLoad <= 0) {
            loadMoreBtn.style.display = 'none';
            return;
        }

        visibleCount += toLoad;

        // Show newly loaded cards with animation
        const newVisible = allCards.slice(visibleCount - toLoad, visibleCount);
        newVisible.forEach(function(card, index) {
            card.style.display = '';
            setTimeout(function() {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }, index * 100);
        });

        updateLoadMoreButton(allCards.length);

        // Dispatch event
        document.dispatchEvent(new CustomEvent('templates-loaded-more', {
            detail: { visible: visibleCount, total: allCards.length }
        }));
    }

    // ============================================
    // 3. TEMPLATE PREVIEW
    // ============================================

    /**
     * Create and show template preview overlay
     */
    function showTemplatePreview(templateName) {
        // Check if overlay already exists
        let overlay = document.querySelector('.template-preview-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'template-preview-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', 'Template Preview');

            overlay.innerHTML = `
                <div class="preview-content">
                    <div class="preview-header">
                        <span class="preview-title">${templateName}</span>
                        <button class="preview-close" aria-label="Close preview">✕</button>
                    </div>
                    <div class="preview-body">
                        <div class="preview-placeholder">
                            <span class="placeholder-icon">🎬</span>
                            <p>Preview video for <strong>${templateName}</strong></p>
                            <p style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;">
                                This is a placeholder. In production, a video preview would play here.
                            </p>
                        </div>
                    </div>
                    <div class="preview-footer">
                        <button class="btn btn-outline preview-close-btn">Close</button>
                        <a href="signup.html" class="btn btn-primary">Use This Template</a>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
        } else {
            // Update title
            const titleEl = overlay.querySelector('.preview-title');
            if (titleEl) titleEl.textContent = templateName;

            const placeholderText = overlay.querySelector('.preview-placeholder p');
            if (placeholderText) {
                placeholderText.innerHTML = 'Preview video for <strong>' + templateName + '</strong>';
            }
        }

        // Open overlay
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Focus management
        const closeBtn = overlay.querySelector('.preview-close');
        if (closeBtn) {
            setTimeout(function() {
                closeBtn.focus();
            }, 100);
        }

        // Close handlers
        const closeHandlers = overlay.querySelectorAll('.preview-close, .preview-close-btn');
        closeHandlers.forEach(function(btn) {
            btn.addEventListener('click', closeTemplatePreview);
        });

        // Click outside to close
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeTemplatePreview();
            }
        });

        // Escape key
        document.addEventListener('keydown', handlePreviewEscape);
    }

    /**
     * Close template preview
     */
    function closeTemplatePreview() {
        const overlay = document.querySelector('.template-preview-overlay');
        if (overlay) {
            overlay.classList.remove('open');
            document.body.style.overflow = '';
        }
        document.removeEventListener('keydown', handlePreviewEscape);
    }

    /**
     * Handle escape key for preview
     */
    function handlePreviewEscape(e) {
        if (e.key === 'Escape') {
            closeTemplatePreview();
        }
    }

    // ============================================
    // 4. TEMPLATE SEARCH (Optional)
    // ============================================

    /**
     * Simple search functionality for templates
     */
    function initTemplateSearch() {
        const searchInput = document.querySelector('.template-search-input');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.toLowerCase().trim();

            searchTimeout = setTimeout(function() {
                templateCards.forEach(function(card) {
                    const name = card.querySelector('.template-name')?.textContent?.toLowerCase() || '';
                    const desc = card.querySelector('.template-desc')?.textContent?.toLowerCase() || '';
                    const matches = !query || name.includes(query) || desc.includes(query);

                    if (matches) {
                        card.style.display = '';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    } else {
                        card.style.display = 'none';
                        card.style.opacity = '0';
                    }
                });

                // Hide load more if searching
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = query ? 'none' : '';
                }
            }, 300);
        });
    }

    // ============================================
    // 5. TEMPLATE CARD INTERACTIVITY
    // ============================================

    /**
     * Add interactive effects to template cards
     */
    function initTemplateCards() {
        templateCards.forEach(function(card) {
            // Click on thumbnail play button
            const playBtn = card.querySelector('.template-play');
            if (playBtn) {
                playBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const name = card.querySelector('.template-name')?.textContent || 'Template';
                    showTemplatePreview(name);
                });
            }

            // Click on preview button
            const previewBtn = card.querySelector('.preview-btn');
            if (previewBtn) {
                previewBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const name = this.dataset.template || 'Template';
                    showTemplatePreview(name);
                });
            }

            // Keyboard accessibility for cards
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const name = this.querySelector('.template-name')?.textContent || 'Template';
                    showTemplatePreview(name);
                }
            });
        });
    }

    // ============================================
    // 6. ANIMATE TEMPLATES ON SCROLL
    // ============================================

    /**
     * Re-trigger reveal animations for filtered templates
     */
    function reTriggerReveal() {
        const revealedElements = document.querySelectorAll('.template-full-card.revealed');
        revealedElements.forEach(function(el) {
            // Check if it's still in the filtered view
            if (el.style.display !== 'none') {
                // Add a small animation class
                el.classList.remove('revealed');
                setTimeout(function() {
                    el.classList.add('revealed');
                }, 50);
            }
        });
    }

    // ============================================
    // 7. EXPOSE PUBLIC API
    // ============================================

    window.TemplatesPage = {
        filter: filterTemplates,
        loadMore: loadMoreTemplates,
        preview: showTemplatePreview,
        closePreview: closeTemplatePreview,
        search: initTemplateSearch,
        initCards: initTemplateCards,
        initAll: function() {
            // Initialize filter buttons
            filterBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const category = this.dataset.filter || 'all';
                    filterTemplates(category);
                    // Scroll to top of grid with offset
                    const grid = document.querySelector('.templates-grid');
                    if (grid) {
                        const navbarHeight = document.querySelector('#navbar')?.offsetHeight || 80;
                        const offset = grid.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                        window.scrollTo({
                            top: offset,
                            behavior: 'smooth'
                        });
                    }
                });
            });

            // Load more button
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', loadMoreTemplates);
            }

            // Initialize card interactions
            initTemplateCards();

            // Initialize search
            initTemplateSearch();

            // Set initial visible count
            const allVisible = Array.from(templateCards).filter(function(card) {
                const category = card.dataset.category || 'all';
                return activeFilter === 'all' || category === activeFilter;
            });
            visibleCount = Math.min(initialVisible, allVisible.length);
            showVisibleCards(allVisible);
            updateLoadMoreButton(allVisible.length);

            console.log('Templates page initialized with', allVisible.length, 'templates.');
        }
    };

    // ============================================
    // 8. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    TemplatesPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                TemplatesPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('Templates page module loaded.');

})();