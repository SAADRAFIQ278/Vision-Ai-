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
        galleryItems.forEach(function(item, index) {
            const itemCategory = item.dataset.category || 'all';
            const shouldShow = category === 'all' || itemCategory === category;

            if (shouldShow) {
                visibleItems.push(item);
                item.style.display = '';
                // Reset position for animation
                item.style.opacity = '0';
                item.style.transform = 'scale(0.95)';
            } else {
                item.style.display = 'none';
                item.style.opacity = '0';
                item.style.transform = '';
            }
        });

        // Reset visible count and show initial items with animation
        visibleCount = Math.min(initialVisible, visibleItems.length);
        showVisibleItems(visibleItems);

        // Update load more button state
        updateLoadMoreButton(visibleItems.length);

        // Dispatch event
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

        // Show visible items with stagger
        visible.forEach(function(item, index) {
            item.style.display = '';
            setTimeout(function() {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            }, index * 60);
        });

        // Hide remaining items
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

        // Show newly loaded items with animation
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

        // Dispatch event
        document.dispatchEvent(new CustomEvent('gallery-loaded-more', {
            detail: { visible: visibleCount, total: allItems.length }
        }));
    }

    // ============================================
    // 3. GALLERY LIGHTBOX
    // ============================================

    let lightbox = null;
    let lightboxImages = [];
    let currentLightboxIndex = 0;

    /**
     * Create and open lightbox for a gallery item
     */
    function openLightbox(item) {
        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-title')?.textContent || 'Gallery Item';
        const tag = item.querySelector('.gallery-tag')?.textContent || '';

        // Build lightbox if it doesn't exist
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'gallery-lightbox';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-modal', 'true');
            lightbox.setAttribute('aria-label', 'Image preview');

            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <button class="lightbox-close" aria-label="Close lightbox">✕</button>
                    <button class="lightbox-nav prev" aria-label="Previous">‹</button>
                    <button class="lightbox-nav next" aria-label="Next">›</button>
                    <div class="lightbox-body">
                        <img src="" alt="Gallery image" />
                    </div>
                    <div class="lightbox-footer">
                        <span class="lightbox-title"></span>
                        <span class="lightbox-tag"></span>
                    </div>
                </div>
            `;

            document.body.appendChild(lightbox);

            // Add event listeners
            const closeBtn = lightbox.querySelector('.lightbox-close');
            const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
            const nextBtn = lightbox.querySelector('.lightbox-nav.next');

            closeBtn.addEventListener('click', closeLightbox);
            prevBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navigateLightbox(-1);
            });
            nextBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navigateLightbox(1);
            });

            // Click outside to close
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });

            // Keyboard navigation
            document.addEventListener('keydown', handleLightboxKeydown);
        }

        // Build the list of all images for navigation
        lightboxImages = Array.from(galleryItems).filter(function(el) {
            const category = el.dataset.category || 'all';
            return activeFilter === 'all' || category === activeFilter;
        });

        // Find index of current item
        currentLightboxIndex = lightboxImages.indexOf(item);
        if (currentLightboxIndex === -1) {
            currentLightboxIndex = 0;
        }

        // Update lightbox content
        updateLightboxContent();

        // Open lightbox
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';

        // Focus management
        setTimeout(function() {
            const closeBtn = lightbox.querySelector('.lightbox-close');
            if (closeBtn) closeBtn.focus();
        }, 100);

        // Dispatch event
        document.dispatchEvent(new CustomEvent('lightbox-open', {
            detail: { index: currentLightboxIndex, total: lightboxImages.length }
        }));
    }

    /**
     * Update lightbox content based on current index
     */
    function updateLightboxContent() {
        if (!lightbox || lightboxImages.length === 0) return;

        const item = lightboxImages[currentLightboxIndex];
        if (!item) return;

        const img = item.querySelector('img');
        const title = item.querySelector('.gallery-title')?.textContent || 'Gallery Item';
        const tag = item.querySelector('.gallery-tag')?.textContent || '';

        const bodyImg = lightbox.querySelector('.lightbox-body img');
        const titleEl = lightbox.querySelector('.lightbox-title');
        const tagEl = lightbox.querySelector('.lightbox-tag');

        if (bodyImg && img) {
            bodyImg.src = img.src;
            bodyImg.alt = title;
        }

        if (titleEl) titleEl.textContent = title;
        if (tagEl) {
            tagEl.textContent = tag;
            tagEl.style.display = tag ? '' : 'none';
        }

        // Update navigation buttons
        const prevBtn = lightbox.querySelector('.lightbox-nav.prev');
        const nextBtn = lightbox.querySelector('.lightbox-nav.next');

        if (prevBtn) {
            prevBtn.style.display = currentLightboxIndex > 0 ? '' : 'none';
        }
        if (nextBtn) {
            nextBtn.style.display = currentLightboxIndex < lightboxImages.length - 1 ? '' : 'none';
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
        if (lightbox) {
            lightbox.classList.remove('open');
            document.body.style.overflow = '';
        }
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

    /**
     * Add interactive effects to gallery items
     */
    function initGalleryItems() {
        galleryItems.forEach(function(item) {
            // Click on item to open lightbox
            item.addEventListener('click', function(e) {
                // Don't open if clicking on play button (if we add video play later)
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

            // Accessibility: keyboard support
            item.setAttribute('tabindex', '0');
            item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(this);
                }
            });

            // Add a subtle animation on hover
            item.addEventListener('mouseenter', function() {
                this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease';
            });
        });

        console.log('Gallery items interactive enhancements applied.');
    }

    // ============================================
    // 5. EXPOSE PUBLIC API
    // ============================================

    window.GalleryPage = {
        filter: filterGallery,
        loadMore: loadMoreItems,
        openLightbox: openLightbox,
        closeLightbox: closeLightbox,
        initItems: initGalleryItems,
        initAll: function() {
            // Initialize filter buttons
            filterBtns.forEach(function(btn) {
                btn.addEventListener('click', function() {
                    const category = this.dataset.filter || 'all';
                    filterGallery(category);
                    // Scroll to top of grid with offset
                    const grid = document.querySelector('.gallery-grid');
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
    // 6. INITIALIZE
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