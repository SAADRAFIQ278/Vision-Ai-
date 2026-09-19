/* ============================================
   VISIONAI - GALLERY PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. DOM REFERENCES
    // ============================================

    const galleryGrid = document.getElementById('galleryGrid');
    const filterBtns = document.querySelectorAll('.gallery-filter .filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const loadMoreBtn = document.getElementById('galleryLoadMore');
    const lightbox = document.getElementById('galleryLightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-nav.prev');
    const lightboxNext = document.querySelector('.lightbox-nav.next');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-body img') : null;
    const lightboxTitle = lightbox ? lightbox.querySelector('.lightbox-title') : null;
    const lightboxTag = lightbox ? lightbox.querySelector('.lightbox-tag') : null;

    // ============================================
    // 2. GALLERY FILTER
    // ============================================

    let activeFilter = 'all';
    let visibleCount = 9;
    const initialVisible = 9;
    const loadIncrement = 6;

    /**
     * Filter gallery items by category
     */
    function filterGallery(category) {
        activeFilter = category;

        // Update active button
        filterBtns.forEach(function(btn) {
            const isActive = btn.dataset.filter === category;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        // Show/hide items based on category
        let visibleItems = [];
        galleryItems.forEach(function(item) {
            const itemCategory = item.dataset.category || 'all';
            const shouldShow = category === 'all' || itemCategory === category;

            if (shouldShow) {
                visibleItems.push(item);
                item.style.display = '';
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
            } else {
                item.style.display = 'none';
                item.style.opacity = '0';
                item.style.transform = '';
            }
        });

        visibleCount = Math.min(initialVisible, visibleItems.length);
        showVisibleItems(visibleItems);
        updateLoadMoreButton(visibleItems.length);

        document.dispatchEvent(new CustomEvent('gallery-filtered', {
            detail: { category: category, total: visibleItems.length }
        }));
    }

    /**
     * Show visible items with staggered animation
     */
    function showVisibleItems(items) {
        const visible = items.slice(0, visibleCount);
        const hidden = items.slice(visibleCount);

        visible.forEach(function(item, index) {
            item.style.display = '';
            setTimeout(function() {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }, index * 60);
        });

        hidden.forEach(function(item) {
            item.style.display = 'none';
            item.style.opacity = '0';
            item.style.transform = '';
        });
    }

    /**
     * Update load more button state
     */
    function updateLoadMoreButton(totalItems) {
        if (!loadMoreBtn) return;

        if (visibleCount >= totalItems) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-flex';
            const remaining = totalItems - visibleCount;
            loadMoreBtn.textContent = 'Load ' + Math.min(loadIncrement, remaining) + ' More';
        }
    }

    /**
     * Load more gallery items
     */
    function loadMoreItems() {
        const allItems = Array.from(galleryItems).filter(function(item) {
            const category = item.dataset.category || 'all';
            return activeFilter === 'all' || category === activeFilter;
        });

        const remaining = allItems.length - visibleCount;
        const toLoad = Math.min(loadIncrement, remaining);

        if (toLoad <= 0) {
            loadMoreBtn.style.display = 'none';
            return;
        }

        visibleCount += toLoad;

        const newVisible = allItems.slice(visibleCount - toLoad, visibleCount);
        newVisible.forEach(function(item, index) {
            item.style.display = '';
            setTimeout(function() {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }, index * 80);
        });

        updateLoadMoreButton(allItems.length);

        document.dispatchEvent(new CustomEvent('gallery-loaded-more', {
            detail: { visible: visibleCount, total: allItems.length }
        }));
    }

    // ============================================
    // 3. GALLERY LIGHTBOX
    // ============================================

    let lightboxImages = [];
    let currentLightboxIndex = 0;

    /**
     * Open lightbox for a gallery item
     */
    function openLightbox(item) {
        if (!lightbox) return;

        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-title')?.textContent || 'Gallery Item';
        const tag = item.querySelector('.gallery-tag')?.textContent || '';

        // Build list of all visible images for navigation
        lightboxImages = Array.from(galleryItems).filter(function(el) {
            const category = el.dataset.category || 'all';
            return activeFilter === 'all' || category === activeFilter;
        });

        currentLightboxIndex = lightboxImages.indexOf(item);
        if (currentLightboxIndex === -1) currentLightboxIndex = 0;

        // Update lightbox content
        updateLightboxContent();

        // Open lightbox
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Focus management
        setTimeout(function() {
            if (lightboxClose) lightboxClose.focus();
        }, 100);

        document.dispatchEvent(new CustomEvent('lightbox-open', {
            detail: { index: currentLightboxIndex, total: lightboxImages.length }
        }));
    }

    /**
     * Update lightbox content based on current index
     */
    function updateLightboxContent() {
        if (!lightbox || lightboxImages.length === 0 || !lightboxImg) return;

        const item = lightboxImages[currentLightboxIndex];
        if (!item) return;

        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-title')?.textContent || 'Gallery Item';
        const tag = item.querySelector('.gallery-tag')?.textContent || '';

        lightboxImg.src = img ? img.src : '';
        lightboxImg.alt = title;

        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxTag) {
            lightboxTag.textContent = tag;
            lightboxTag.style.display = tag ? '' : 'none';
        }

        // Update navigation buttons
        if (lightboxPrev) {
            lightboxPrev.style.display = currentLightboxIndex > 0 ? '' : 'none';
        }
        if (lightboxNext) {
            lightboxNext.style.display = currentLightboxIndex < lightboxImages.length - 1 ? '' : 'none';
        }
    }

    /**
     * Navigate lightbox
     */
    function navigateLightbox(direction) {
        const newIndex = currentLightboxIndex + direction;
        if (newIndex < 0 || newIndex >= lightboxImages.length) return;

        currentLightboxIndex = newIndex;
        updateLightboxContent();
    }

    /**
     * Close lightbox
     */
    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleLightboxKeydown);
    }

    /**
     * Handle keyboard events for lightbox
     */
    function handleLightboxKeydown(e) {
        if (!lightbox || !lightbox.classList.contains('open')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navigateLightbox(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            navigateLightbox(1);
        }
    }

    // ============================================
    // 4. GALLERY ITEM INTERACTIVITY
    // ============================================

    function initGalleryItems() {
        galleryItems.forEach(function(item) {
            // Click on item to open lightbox
            item.addEventListener('click', function(e) {
                if (e.target.closest('.gallery-play')) return;
                openLightbox(this);
            });

            // Click on play button
            const playBtn = item.querySelector('.gallery-play');
            if (playBtn) {
                playBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    openLightbox(item);
                });
            }

            // Keyboard support
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(this);
                }
            });
        });
    }

    // ============================================
    // 5. LIGHTBOX EVENT LISTENERS
    // ============================================

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            navigateLightbox(-1);
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            navigateLightbox(1);
        });
    }

    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', handleLightboxKeydown);

    // ============================================
    // 6. KEYBOARD SHORTCUTS (Global)
    // ============================================

    document.addEventListener('keydown', function(e) {
        // 'G' key to focus gallery
        if (e.key === 'g' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const firstItem = document.querySelector('.gallery-item');
            if (firstItem) {
                firstItem.focus();
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('🔍 Gallery focused. Use arrow keys to navigate.');
                }
            }
        }
    });

    // ============================================
    // 7. EXPOSE PUBLIC API
    // ============================================

    window.GalleryPage = {
        filter: filterGallery,
        loadMore: loadMoreItems,
        openLightbox: openLightbox,
        closeLightbox: closeLightbox,
        navigateLightbox: navigateLightbox,
        initItems: initGalleryItems,
        initAll: function() {
            // Initialize filter buttons
            filterBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const category = this.dataset.filter || 'all';
                    filterGallery(category);
                    const grid = document.querySelector('.gallery-grid');
                    if (grid) {
                        const navbarHeight = document.querySelector('#navbar')?.offsetHeight || 80;
                        const offset = grid.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                        window.scrollTo({ top: offset, behavior: 'smooth' });
                    }
                });
            });

            // Load more button
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', loadMoreItems);
            }

            // Initialize item interactions
            initGalleryItems();

            // Set initial visible count
            const allVisible = Array.from(galleryItems).filter(function(item) {
                const category = item.dataset.category || 'all';
                return activeFilter === 'all' || category === activeFilter;
            });
            visibleCount = Math.min(initialVisible, allVisible.length);
            showVisibleItems(allVisible);
            updateLoadMoreButton(allVisible.length);

            console.log('Gallery page initialized with', allVisible.length, 'items.');
        }
    };

    // ============================================
    // 8. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    GalleryPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                GalleryPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('Gallery page module loaded.');

})();