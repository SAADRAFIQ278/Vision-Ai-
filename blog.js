/* ============================================
   VISIONAI - BLOG PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. BLOG SEARCH
    // ============================================

    /**
     * Initialize blog search functionality
     */
    function initBlogSearch() {
        const searchForm = document.getElementById('blogSearchForm');
        if (!searchForm) return;

        const searchInput = searchForm.querySelector('input[type="text"]');
        const blogCards = document.querySelectorAll('.blog-card');
        const featuredPost = document.querySelector('.blog-post.featured');

        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();

            if (!query) {
                // Reset - show everything
                blogCards.forEach(function(card) {
                    card.style.display = '';
                });
                if (featuredPost) featuredPost.style.display = '';
                return;
            }

            // Search through blog cards
            let foundCount = 0;
            blogCards.forEach(function(card) {
                const title = card.querySelector('.blog-title')?.textContent?.toLowerCase() || '';
                const excerpt = card.querySelector('.blog-excerpt')?.textContent?.toLowerCase() || '';
                const category = card.querySelector('.post-category')?.textContent?.toLowerCase() || '';

                const matches = title.includes(query) || excerpt.includes(query) || category.includes(query);

                if (matches) {
                    card.style.display = '';
                    foundCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Search featured post
            if (featuredPost) {
                const title = featuredPost.querySelector('.post-title')?.textContent?.toLowerCase() || '';
                const excerpt = featuredPost.querySelector('.post-excerpt')?.textContent?.toLowerCase() || '';
                const matches = title.includes(query) || excerpt.includes(query);
                featuredPost.style.display = matches ? '' : 'none';
                if (matches) foundCount++;
            }

            // Show message if no results
            const grid = document.querySelector('.blog-grid');
            let noResultsMsg = grid.querySelector('.no-results-message');

            if (foundCount === 0) {
                if (!noResultsMsg) {
                    noResultsMsg = document.createElement('div');
                    noResultsMsg.className = 'no-results-message';
                    noResultsMsg.style.cssText = `
                            grid-column: 1 / -1;
                            text-align: center;
                            padding: 40px 20px;
                            color: var(--text-paragraph);
                        `;
                    noResultsMsg.innerHTML = `
                            <span style="font-size:3rem;display:block;margin-bottom:12px;">🔍</span>
                            <p style="font-size:1.1rem;color:var(--text-white);">No results found</p>
                            <p style="font-size:0.9rem;">Try adjusting your search terms</p>
                        `;
                    grid.appendChild(noResultsMsg);
                }
                noResultsMsg.style.display = 'block';
            } else {
                if (noResultsMsg) {
                    noResultsMsg.style.display = 'none';
                }
            }
        });

        // Clear search on input clear (if user deletes all text)
        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                // Trigger a reset search
                searchForm.dispatchEvent(new Event('submit'));
            }
        });

        console.log('Blog search initialized.');
    }

    // ============================================
    // 2. BLOG PAGINATION
    // ============================================

    /**
     * Initialize blog pagination (simulated)
     */
    function initBlogPagination() {
        const paginationBtns = document.querySelectorAll('.pagination-numbers .pagination-btn');
        const prevBtn = document.querySelector('.pagination-btn.prev');
        const nextBtn = document.querySelector('.pagination-btn.next');

        if (paginationBtns.length === 0) return;

        let currentPage = 1;
        const totalPages = 8;

        function updatePagination(page) {
            // Update active state
            paginationBtns.forEach(function(btn) {
                const btnPage = parseInt(btn.textContent);
                btn.classList.toggle('active', btnPage === page);
            });

            // Update prev/next buttons
            if (prevBtn) {
                prevBtn.disabled = page <= 1;
            }
            if (nextBtn) {
                nextBtn.disabled = page >= totalPages;
            }

            // Simulate loading new content
            // In production, this would fetch new posts via AJAX
            const grid = document.querySelector('.blog-grid');
            if (grid) {
                // Add a loading animation
                grid.style.opacity = '0.5';
                grid.style.transition = 'opacity 0.3s ease';

                setTimeout(function() {
                    grid.style.opacity = '1';
                    // Scroll to top of grid
                    const gridTop = grid.getBoundingClientRect().top + window.pageYOffset - 100;
                    window.scrollTo({ top: gridTop, behavior: 'smooth' });

                    // Show toast notification
                    if (window.VisionAI && window.VisionAI.Toast) {
                        window.VisionAI.Toast.info('Loading page ' + page + '...');
                    }
                }, 400);
            }

            currentPage = page;
        }

        // Add click handlers to page numbers
        paginationBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const page = parseInt(this.textContent);
                if (!isNaN(page) && page !== currentPage) {
                    updatePagination(page);
                }
            });
        });

        // Prev button
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    updatePagination(currentPage - 1);
                }
            });
        }

        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (currentPage < totalPages) {
                    updatePagination(currentPage + 1);
                }
            });
        }

        console.log('Blog pagination initialized.');
    }

    // ============================================
    // 3. SIDEBAR NEWSLETTER
    // ============================================

    /**
     * Initialize sidebar newsletter form
     */
    function initSidebarNewsletter() {
        const form = document.getElementById('sidebarNewsletter');
        if (!form) return;

        const messageEl = document.getElementById('sidebarNewsletterMessage');
        const input = form.querySelector('input[type="email"]');

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = input.value.trim();

            if (!email) {
                if (messageEl) {
                    messageEl.textContent = 'Please enter your email address.';
                    messageEl.style.color = '#EF4444';
                }
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                if (messageEl) {
                    messageEl.textContent = 'Please enter a valid email address.';
                    messageEl.style.color = '#EF4444';
                }
                return;
            }

            // Show loading
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.textContent = 'Subscribing...';
                submitBtn.disabled = true;
            }

            if (messageEl) {
                messageEl.textContent = 'Subscribing...';
                messageEl.style.color = '#A1A1AA';
            }

            // Simulate API call
            setTimeout(function() {
                if (messageEl) {
                    messageEl.textContent = '✅ Subscribed successfully! Check your inbox.';
                    messageEl.style.color = '#10B981';
                }
                if (input) input.value = '';
                if (submitBtn) {
                    submitBtn.textContent = originalText || 'Subscribe';
                    submitBtn.disabled = false;
                }

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.success('Subscribed to blog newsletter!');
                }
            }, 800);
        });

        console.log('Sidebar newsletter initialized.');
    }

    // ============================================
    // 4. CATEGORY FILTER (optional)
    // ============================================

    /**
     * Allow clicking on category links to filter posts
     */
    function initCategoryFilter() {
        const categoryLinks = document.querySelectorAll('.categories-list a');
        if (categoryLinks.length === 0) return;

        categoryLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.textContent.trim().replace(/\(\d+\)/, '').trim().toLowerCase();

                // Find search input and populate it
                const searchInput = document.querySelector('#blogSearchForm input[type="text"]');
                if (searchInput) {
                    searchInput.value = category;
                    const searchForm = document.getElementById('blogSearchForm');
                    if (searchForm) {
                        searchForm.dispatchEvent(new Event('submit'));
                    }
                }

                // Scroll to blog grid
                const grid = document.querySelector('.blog-grid');
                if (grid) {
                    const navbarHeight = document.querySelector('#navbar')?.offsetHeight || 80;
                    const offset = grid.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                }
            });
        });

        console.log('Category filter initialized.');
    }

    // ============================================
    // 5. RECENT POSTS CLICK HANDLER
    // ============================================

    function initRecentPosts() {
        const recentLinks = document.querySelectorAll('.recent-list a');
        if (recentLinks.length === 0) return;

        recentLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const title = this.querySelector('.recent-title')?.textContent || 'Post';

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('Loading: ' + title);
                }

                // Simulate loading
                console.log('Loading post:', title);
            });
        });
    }

    // ============================================
    // 6. EXPOSE PUBLIC API
    // ============================================

    window.BlogPage = {
        initSearch: initBlogSearch,
        initPagination: initBlogPagination,
        initSidebarNewsletter: initSidebarNewsletter,
        initCategoryFilter: initCategoryFilter,
        initRecentPosts: initRecentPosts,
        initAll: function() {
            initBlogSearch();
            initBlogPagination();
            initSidebarNewsletter();
            initCategoryFilter();
            initRecentPosts();
        }
    };

    // ============================================
    // 7. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    BlogPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                BlogPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('Blog page module loaded.');

})();