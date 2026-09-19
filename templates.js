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
    const previewBtns = document.querySelectorAll('.template-preview-btn');
    const previewModal = document.getElementById('templatePreviewModal');
    const previewClose = document.querySelector('.template-preview-close');
    const previewTitle = document.querySelector('.template-preview-title');
    const previewDesc = document.querySelector('.template-preview-desc');
    const previewMeta = document.querySelector('.template-preview-meta');
    const previewVideo = document.querySelector('.template-preview-video video');
    const previewUseBtn = document.querySelector('.template-preview-info .btn');

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
        templateCards.forEach(function(card) {
            const cardCategory = card.dataset.category || 'all';
            const shouldShow = category === 'all' || cardCategory === category;

            if (shouldShow) {
                visibleCards.push(card);
                card.style.display = '';
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

        // Show toast
        if (window.VisionAI && window.VisionAI.Toast) {
            window.VisionAI.Toast.success('Loaded ' + toLoad + ' more templates!');
        }
    }

    // ============================================
    // 3. TEMPLATE PREVIEW
    // ============================================

    let currentTemplateName = '';

    /**
     * Open template preview modal
     */
    function openTemplatePreview(card) {
        if (!card) return;

        const name = card.querySelector('.template-name')?.textContent || 'Template';
        const desc = card.querySelector('.template-desc')?.textContent || '';
        const video = card.querySelector('.template-thumb .template-video');
        const metaTags = card.querySelectorAll('.template-meta-tags span');
        const badge = card.querySelector('.template-badge');

        currentTemplateName = name;

        // Update modal content
        if (previewTitle) previewTitle.textContent = name;

        if (previewDesc) {
            previewDesc.textContent = desc || 'Professional AI video template for your next project.';
        }

        // Update meta tags
        if (previewMeta) {
            previewMeta.innerHTML = '';
            metaTags.forEach(function(tag) {
                const span = document.createElement('span');
                span.textContent = tag.textContent;
                previewMeta.appendChild(span);
            });
            // Add default meta if none exist
            if (metaTags.length === 0) {
                const defaultMeta = ['⏱ 30-60s', '🎨 12 styles', '📱 4K'];
                defaultMeta.forEach(function(text) {
                    const span = document.createElement('span');
                    span.textContent = text;
                    previewMeta.appendChild(span);
                });
            }
        }

        // Update video
        if (previewVideo && video) {
            const source = video.querySelector('source');
            if (source) {
                const videoSource = previewVideo.querySelector('source');
                if (videoSource) {
                    videoSource.src = source.src;
                    previewVideo.load();
                }
            }
            // Set poster
            if (video.poster) {
                previewVideo.poster = video.poster;
            }
        }

        // Update use button link
        if (previewUseBtn) {
            previewUseBtn.href = 'signup.html?template=' + encodeURIComponent(name);
        }

        // Open modal
        if (previewModal) {
            previewModal.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Focus close button
            setTimeout(function() {
                if (previewClose) previewClose.focus();
            }, 100);
        }

        // Dispatch event
        document.dispatchEvent(new CustomEvent('template-preview-open', {
            detail: { name: name }
        }));
    }

    /**
     * Close template preview modal
     */
    function closeTemplatePreview() {
        if (previewModal) {
            previewModal.classList.remove('open');
            document.body.style.overflow = '';

            // Pause video
            if (previewVideo) {
                previewVideo.pause();
                previewVideo.currentTime = 0;
            }
        }

        // Dispatch event
        document.dispatchEvent(new CustomEvent('template-preview-close'));
    }

    // ============================================
    // 4. TEMPLATE CARD INTERACTIVITY
    // ============================================

    function initTemplateCards() {
        templateCards.forEach(function(card) {
            // Click on card preview button
            const previewBtn = card.querySelector('.template-preview-btn');
            if (previewBtn) {
                previewBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openTemplatePreview(card);
                });
            }

            // Click on play button in thumbnail
            const playBtn = card.querySelector('.template-thumb .template-play-btn');
            if (playBtn) {
                playBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openTemplatePreview(card);
                });
            }

            // Click on the thumbnail itself (but not on buttons)
            const thumb = card.querySelector('.template-thumb');
            if (thumb) {
                thumb.addEventListener('click', function(e) {
                    if (e.target.closest('.template-play-btn') || e.target.closest('.template-badge')) return;
                    openTemplatePreview(card);
                });
            }

            // Keyboard accessibility for cards
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openTemplatePreview(this);
                }
            });

            // Hover effect: pause/play video
            const video = card.querySelector('.template-thumb .template-video');
            if (video) {
                card.addEventListener('mouseenter', function() {
                    if (video.paused) {
                        video.play().catch(function() {});
                    }
                });
                card.addEventListener('mouseleave', function() {
                    if (!video.paused) {
                        video.pause();
                        video.currentTime = 0;
                    }
                });
            }
        });

        console.log('Template cards initialized.');
    }

    // ============================================
    // 5. PREVIEW MODAL CONTROLS
    // ============================================

    function initPreviewModal() {
        // Close button
        if (previewClose) {
            previewClose.addEventListener('click', closeTemplatePreview);
        }

        // Click outside to close
        if (previewModal) {
            previewModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    closeTemplatePreview();
                }
            });
        }

        // Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && previewModal && previewModal.classList.contains('open')) {
                closeTemplatePreview();
            }
        });

        // Keyboard: arrow keys to navigate templates (if preview is open)
        document.addEventListener('keydown', function(e) {
            if (!previewModal || !previewModal.classList.contains('open')) return;

            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                const currentCards = Array.from(templateCards).filter(function(card) {
                    const category = card.dataset.category || 'all';
                    return activeFilter === 'all' || category === activeFilter;
                });

                const currentIndex = currentCards.findIndex(function(card) {
                    const name = card.querySelector('.template-name')?.textContent || '';
                    return name === currentTemplateName;
                });

                let newIndex;
                if (e.key === 'ArrowLeft') {
                    newIndex = currentIndex > 0 ? currentIndex - 1 : currentCards.length - 1;
                } else {
                    newIndex = currentIndex < currentCards.length - 1 ? currentIndex + 1 : 0;
                }

                if (currentCards[newIndex]) {
                    openTemplatePreview(currentCards[newIndex]);
                }
            }
        });

        console.log('Preview modal initialized.');
    }

    // ============================================
    // 6. TEMPLATE SEARCH
    // ============================================

    function initTemplateSearch() {
        const searchInput = document.querySelector('.template-search-input');
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim().toLowerCase();

            searchTimeout = setTimeout(function() {
                let visibleCards = [];
                templateCards.forEach(function(card) {
                    const name = card.querySelector('.template-name')?.textContent?.toLowerCase() || '';
                    const desc = card.querySelector('.template-desc')?.textContent?.toLowerCase() || '';
                    const category = card.dataset.category || '';
                    const matches = !query ||
                        name.includes(query) ||
                        desc.includes(query) ||
                        category.includes(query);

                    if (matches) {
                        visibleCards.push(card);
                        card.style.display = '';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    } else {
                        card.style.display = 'none';
                        card.style.opacity = '0';
                        card.style.transform = '';
                    }
                });

                // Hide load more if searching
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = query ? 'none' : '';
                }

                // Show no results message
                let noResults = document.querySelector('.templates-no-results');
                if (visibleCards.length === 0 && query) {
                    if (!noResults) {
                        noResults = document.createElement('div');
                        noResults.className = 'templates-no-results';
                        noResults.style.cssText = `
                            grid-column: 1 / -1;
                            text-align: center;
                            padding: 60px 20px;
                            color: var(--text-paragraph);
                        `;
                        noResults.innerHTML = `
                            <span style="font-size:3rem;display:block;margin-bottom:12px;">🔍</span>
                            <p style="font-size:1.1rem;color:var(--text-white);">No templates found</p>
                            <p style="font-size:0.9rem;">Try adjusting your search terms</p>
                        `;
                        templatesGrid.appendChild(noResults);
                    }
                    noResults.style.display = 'block';
                } else {
                    if (noResults) {
                        noResults.style.display = 'none';
                    }
                }
            }, 300);
        });

        console.log('Template search initialized.');
    }

    // ============================================
    // 7. KEYBOARD SHORTCUTS
    // ============================================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Press 'T' to focus first template
            if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const firstCard = document.querySelector('.template-full-card');
                if (firstCard) {
                    e.preventDefault();
                    firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstCard.focus();
                    if (window.VisionAI && window.VisionAI.Toast) {
                        window.VisionAI.Toast.info('🎯 Focused on Templates');
                    }
                }
            }

            // Press 'F' to focus filter
            if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const firstFilter = document.querySelector('.filter-btn');
                if (firstFilter) {
                    e.preventDefault();
                    firstFilter.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstFilter.focus();
                }
            }
        });
    }

    // ============================================
    // 8. TEMPLATE CARD STATS ANIMATION
    // ============================================

    function initCardStats() {
        // Add subtle entrance animation to cards when they come into view
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const card = entry.target;
                        if (!card.classList.contains('revealed')) {
                            card.classList.add('revealed');
                        }
                        observer.unobserve(card);
                    }
                });
            }, { threshold: 0.1, rootMargin: '50px' });

            templateCards.forEach(function(card) {
                observer.observe(card);
            });
        }
    }

    // ============================================
    // 9. EXPOSE PUBLIC API
    // ============================================

    window.TemplatesPage = {
        filter: filterTemplates,
        loadMore: loadMoreTemplates,
        openPreview: openTemplatePreview,
        closePreview: closeTemplatePreview,
        initCards: initTemplateCards,
        initPreview: initPreviewModal,
        initSearch: initTemplateSearch,
        initShortcuts: initKeyboardShortcuts,
        initStats: initCardStats,
        initAll: function() {
            initTemplateCards();
            initPreviewModal();
            initTemplateSearch();
            initKeyboardShortcuts();
            initCardStats();

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
    // 10. INITIALIZE
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