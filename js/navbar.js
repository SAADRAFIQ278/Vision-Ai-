/* ============================================
   VISIONAI - NAVBAR JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. DOM REFERENCES
    // ============================================

    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');
    const progressBar = document.getElementById('scroll-progress');
    const body = document.body;

    // ============================================
    // 2. STICKY NAVBAR
    // ============================================

    let lastScrollY = 0;
    let isNavbarScrolled = false;
    let scrollTimeout = null;

    function updateNavbar() {
        const currentScrollY = window.scrollY;

        // Determine if we should add the scrolled class
        const shouldBeScrolled = currentScrollY > 50;

        if (shouldBeScrolled !== isNavbarScrolled) {
            isNavbarScrolled = shouldBeScrolled;
            if (isNavbarScrolled) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Update scroll progress bar
        if (progressBar) {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('aria-valuenow', Math.round(progress));
        }

        lastScrollY = currentScrollY;
    }

    // Throttled scroll handler for performance
    function throttledUpdateNavbar() {
        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = requestAnimationFrame(updateNavbar);
    }

    // Listen to scroll events
    window.addEventListener('scroll', throttledUpdateNavbar, { passive: true });
    window.addEventListener('resize', updateNavbar, { passive: true });

    // Initial update
    updateNavbar();

    // ============================================
    // 3. MOBILE MENU (HAMBURGER)
    // ============================================

    let isMenuOpen = false;

    function toggleMenu(forceState) {
        const shouldOpen = forceState !== undefined ? forceState : !isMenuOpen;
        isMenuOpen = shouldOpen;

        if (hamburger) {
            hamburger.setAttribute('aria-expanded', isMenuOpen);
        }

        if (navLinks) {
            navLinks.classList.toggle('open', isMenuOpen);
        }

        // Prevent body scroll when menu is open
        if (isMenuOpen) {
            body.style.overflow = 'hidden';
            // Add a class for any additional styling
            body.classList.add('menu-open');
        } else {
            body.style.overflow = '';
            body.classList.remove('menu-open');
        }

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('navbar-toggle', {
            detail: { isOpen: isMenuOpen }
        }));
    }

    function openMenu() {
        if (!isMenuOpen) toggleMenu(true);
    }

    function closeMenu() {
        if (isMenuOpen) toggleMenu(false);
    }

    // Hamburger click handler
    if (hamburger) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Close menu on link click (mobile)
    if (navLinks) {
        const links = navLinks.querySelectorAll('a');
        links.forEach(function(link) {
            link.addEventListener('click', function() {
                if (isMenuOpen) {
                    // Small delay to allow the click to register before closing
                    setTimeout(closeMenu, 100);
                }
            });
        });
    }

    // Close menu on outside click
    document.addEventListener('click', function(e) {
        if (isMenuOpen && navbar && !navbar.contains(e.target)) {
            closeMenu();
        }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });

    // Close menu on window resize (if going from mobile to desktop)
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', function() {
        const currentWidth = window.innerWidth;
        // If width increased beyond mobile breakpoint and menu is open, close it
        if (currentWidth > 768 && isMenuOpen && lastWidth <= 768) {
            closeMenu();
        }
        lastWidth = currentWidth;
    }, { passive: true });

    // ============================================
    // 4. NAVBAR HIDE ON SCROLL DOWN (Optional enhancement)
    // ============================================

    let prevScrollY = 0;
    let autoHideEnabled = false; // Set to true to enable auto-hide

    function handleAutoHide() {
        if (!autoHideEnabled) return;

        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - prevScrollY;

        // Only apply on desktop (width > 768px)
        if (window.innerWidth <= 768) {
            navbar.style.transform = '';
            return;
        }

        // Hide navbar when scrolling down, show when scrolling up
        if (scrollDelta > 10 && currentScrollY > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else if (scrollDelta < -10 || currentScrollY < 100) {
            navbar.style.transform = 'translateY(0)';
        }

        prevScrollY = currentScrollY;
    }

    // Uncomment to enable auto-hide
    // window.addEventListener('scroll', handleAutoHide, { passive: true });

    // ============================================
    // 5. NAVBAR ACTIVE LINK HIGHLIGHT
    // ============================================

    function highlightActiveLink() {
        if (!navLinks) return;

        const links = navLinks.querySelectorAll('a');
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        links.forEach(function(link) {
            const href = link.getAttribute('href');
            // Remove active class from all
            link.classList.remove('active');

            // Check if this link matches the current page
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else if (href === 'index.html' && currentPage === '') {
                link.classList.add('active');
            } else if (href && currentPage.includes(href.replace('.html', '')) && href !== '#') {
                // Partial match for sub-pages like /features, /pricing, etc.
                // But only if href is not just a fragment
                if (href.indexOf('#') !== 0) {
                    link.classList.add('active');
                }
            }
        });
    }

    // Run on load and on hash change
    highlightActiveLink();
    window.addEventListener('hashchange', highlightActiveLink);

    // ============================================
    // 6. NAVBAR SEARCH (Optional - if search is added later)
    // ============================================

    // Placeholder for search functionality
    function initSearch() {
        const searchInput = document.querySelector('.navbar-search');
        if (searchInput) {
            searchInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    const query = this.value.trim();
                    if (query.length > 0) {
                        // Perform search - redirect to search results or filter
                        console.log('Searching for:', query);
                        // You can implement search logic here
                    }
                }
            });
        }
    }

    // ============================================
    // 7. DROPDOWN MENUS (if any)
    // ============================================

    function initDropdowns() {
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        dropdowns.forEach(function(dropdown) {
            const toggle = dropdown.querySelector('.nav-dropdown-toggle');
            const menu = dropdown.querySelector('.nav-dropdown-menu');

            if (toggle && menu) {
                // Toggle on click
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const isOpen = menu.classList.contains('open');
                    // Close all other dropdowns
                    dropdowns.forEach(function(d) {
                        const m = d.querySelector('.nav-dropdown-menu');
                        if (m && m !== menu) {
                            m.classList.remove('open');
                        }
                    });
                    menu.classList.toggle('open');
                });

                // Close on outside click
                document.addEventListener('click', function(e) {
                    if (!dropdown.contains(e.target)) {
                        menu.classList.remove('open');
                    }
                });

                // Close on Escape
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && menu.classList.contains('open')) {
                        menu.classList.remove('open');
                    }
                });
            }
        });
    }

    // ============================================
    // 8. EXPOSE PUBLIC API
    // ============================================

    window.Navbar = {
        open: openMenu,
        close: closeMenu,
        toggle: toggleMenu,
        isOpen: function() { return isMenuOpen; },
        update: updateNavbar,
        highlight: highlightActiveLink
    };

    // ============================================
    // 9. INITIALIZE
    // ============================================

    function init() {
        // Initial setup
        updateNavbar();

        // Initialize dropdowns if any exist
        initDropdowns();

        // Initialize search if any
        initSearch();

        console.log('Navbar initialized successfully.');
        console.log('Menu state:', isMenuOpen ? 'open' : 'closed');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();