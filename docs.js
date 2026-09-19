/* ============================================
   VISIONAI - DOCS PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. DOM REFERENCES
    // ============================================

    const navLinks = document.querySelectorAll('.docs-sidebar .docs-nav a');
    const sections = document.querySelectorAll('.docs-content section');
    const sidebar = document.querySelector('.docs-sidebar');
    const codeBlocks = document.querySelectorAll('.docs-code');
    const tocToggle = document.querySelector('.toc-toggle');
    const searchInput = document.querySelector('.docs-search-input');

    // ============================================
    // 2. SIDEBAR NAVIGATION
    // ============================================

    /**
     * Initialize sidebar navigation with active state tracking
     */
    function initSidebarNav() {
        if (navLinks.length === 0 || sections.length === 0) return;

        // Function to update active link based on scroll position
        function updateActiveLink() {
            let currentSection = '';
            const scrollPosition = window.scrollY + 120;

            sections.forEach(function(section) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    currentSection = section.id;
                }
            });

            navLinks.forEach(function(link) {
                const href = link.getAttribute('href').replace('#', '');
                link.classList.toggle('active', href === currentSection);
            });
        }

        // Throttled scroll handler
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // Click handler for smooth scroll
        navLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const target = document.querySelector(targetId);
                if (!target) return;

                const navbarHeight = document.querySelector('#navbar')?.offsetHeight || 80;
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Update active state immediately
                navLinks.forEach(function(l) {
                    l.classList.remove('active');
                });
                this.classList.add('active');

                // Update URL hash without scrolling
                if (history.pushState) {
                    history.pushState(null, null, targetId);
                }

                // Close mobile sidebar if open
                if (window.innerWidth < 1024 && navLinks) {
                    const sidebar = document.querySelector('.docs-sidebar');
                    if (sidebar) {
                        const toggle = sidebar.querySelector('.toc-toggle');
                        if (toggle && toggle.getAttribute('aria-expanded') === 'true') {
                            toggle.click();
                        }
                    }
                }
            });
        });

        // Initial update
        setTimeout(updateActiveLink, 100);

        // Update on resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateActiveLink, 200);
        }, { passive: true });

        console.log('Docs sidebar navigation initialized.');
    }

    // ============================================
    // 3. CODE COPY BUTTONS
    // ============================================

    /**
     * Add copy buttons to code blocks
     */
    function initCodeCopy() {
        if (codeBlocks.length === 0) return;

        codeBlocks.forEach(function(block) {
            // Create copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'code-copy-btn';
            copyBtn.setAttribute('aria-label', 'Copy code');
            copyBtn.innerHTML = '📋';
            copyBtn.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: rgba(255,255,255,0.06);
                border: 1px solid var(--border-light);
                border-radius: var(--radius-sm);
                color: var(--text-paragraph);
                padding: 4px 10px;
                font-size: 0.7rem;
                cursor: pointer;
                transition: all var(--transition-fast);
                opacity: 0;
                font-family: var(--font-family);
                z-index: 5;
            `;

            // Make block position relative for absolute positioning
            block.style.position = 'relative';

            // Show button on hover
            block.addEventListener('mouseenter', function() {
                copyBtn.style.opacity = '1';
            });
            block.addEventListener('mouseleave', function() {
                copyBtn.style.opacity = '0';
            });

            // Copy functionality
            copyBtn.addEventListener('click', function() {
                const text = block.textContent.trim();
                navigator.clipboard.writeText(text).then(function() {
                    // Success feedback
                    const originalText = copyBtn.innerHTML;
                    copyBtn.innerHTML = '✓ Copied!';
                    copyBtn.style.color = 'var(--success)';
                    copyBtn.style.background = 'rgba(16,185,129,0.15)';
                    setTimeout(function() {
                        copyBtn.innerHTML = originalText;
                        copyBtn.style.color = '';
                        copyBtn.style.background = '';
                    }, 2000);

                    if (window.VisionAI && window.VisionAI.Toast) {
                        window.VisionAI.Toast.success('Code copied to clipboard!');
                    }
                }).catch(function() {
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = text;
                    document.body.appendChild(textArea);
                    textArea.select();
                    try {
                        document.execCommand('copy');
                        if (window.VisionAI && window.VisionAI.Toast) {
                            window.VisionAI.Toast.success('Code copied to clipboard!');
                        }
                    } catch (err) {
                        if (window.VisionAI && window.VisionAI.Toast) {
                            window.VisionAI.Toast.error('Failed to copy code.');
                        }
                    }
                    document.body.removeChild(textArea);
                });
            });

            block.appendChild(copyBtn);
        });

        console.log('Code copy buttons initialized.');
    }

    // ============================================
    // 4. TABLE OF CONTENTS TOGGLE (Mobile)
    // ============================================

    function initTocToggle() {
        if (!sidebar) return;

        // Only add toggle on mobile (below 1024px)
        const isMobile = window.innerWidth < 1024;

        // Check if toggle already exists
        let toggle = sidebar.querySelector('.toc-toggle');
        if (!toggle) {
            toggle = document.createElement('button');
            toggle.className = 'toc-toggle';
            toggle.setAttribute('aria-expanded', 'false');
            toggle.innerHTML = '📖 Table of Contents <span class="toc-arrow">▼</span>';
            toggle.style.cssText = `
                display: none;
                width: 100%;
                padding: 10px 16px;
                background: rgba(255,255,255,0.04);
                border: 1px solid var(--border-light);
                border-radius: var(--radius-sm);
                color: var(--text-white);
                font-family: var(--font-family);
                font-size: 0.85rem;
                cursor: pointer;
                text-align: left;
                transition: all var(--transition-fast);
                margin-bottom: 8px;
            `;

            // Only show toggle on mobile
            if (window.innerWidth < 1024) {
                toggle.style.display = 'block';
            }

            // Toggle the nav visibility
            const nav = sidebar.querySelector('.docs-nav');
            toggle.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
                this.setAttribute('aria-expanded', isExpanded);
                if (nav) {
                    nav.style.display = isExpanded ? '' : 'none';
                }
                const arrow = this.querySelector('.toc-arrow');
                if (arrow) {
                    arrow.textContent = isExpanded ? '▲' : '▼';
                }
            });

            // Insert at top of sidebar
            sidebar.insertBefore(toggle, sidebar.firstChild);

            // On desktop, show nav and hide toggle
            window.addEventListener('resize', function() {
                const width = window.innerWidth;
                if (width >= 1024) {
                    toggle.style.display = 'none';
                    if (nav) nav.style.display = '';
                } else {
                    toggle.style.display = 'block';
                    // If nav is not expanded, hide it
                    if (toggle.getAttribute('aria-expanded') === 'false') {
                        if (nav) nav.style.display = 'none';
                    } else {
                        if (nav) nav.style.display = '';
                    }
                }
            }, { passive: true });
        }

        console.log('Table of Contents toggle initialized.');
    }

    // ============================================
    // 5. DOCUMENTATION SEARCH
    // ============================================

    function initDocSearch() {
        if (!searchInput) return;

        let searchTimeout;

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim().toLowerCase();

            searchTimeout = setTimeout(function() {
                sections.forEach(function(section) {
                    const text = section.textContent.toLowerCase();
                    const matches = !query || text.includes(query);

                    if (matches) {
                        section.style.display = '';
                        // Highlight matches if query exists
                        if (query) {
                            highlightSearchTerms(section, query);
                        } else {
                            clearHighlights(section);
                        }
                    } else {
                        section.style.display = 'none';
                    }
                });

                // Show/hide no results message
                let noResults = document.querySelector('.docs-no-results');
                const visibleSections = Array.from(sections).filter(function(s) {
                    return s.style.display !== 'none';
                });

                if (visibleSections.length === 0 && query) {
                    if (!noResults) {
                        noResults = document.createElement('div');
                        noResults.className = 'docs-no-results';
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
                        const container = document.querySelector('.docs-content');
                        if (container) container.appendChild(noResults);
                    }
                    noResults.style.display = 'block';
                } else {
                    if (noResults) {
                        noResults.style.display = 'none';
                    }
                }
            }, 300);
        });
    }

    /**
     * Highlight search terms in content
     */
    function highlightSearchTerms(container, query) {
        // Remove existing highlights
        clearHighlights(container);

        // Find text nodes and highlight matches
        const walker = document.createTreeWalker(
            container,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script, style, and code blocks
                    if (node.parentElement.closest('script, style, .docs-code')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(function(textNode) {
            const text = textNode.textContent;
            const lowerText = text.toLowerCase();
            const index = lowerText.indexOf(query);

            if (index !== -1) {
                const fragment = document.createDocumentFragment();
                const before = document.createTextNode(text.substring(0, index));
                const highlight = document.createElement('mark');
                highlight.textContent = text.substring(index, index + query.length);
                highlight.style.cssText = `
                    background: rgba(124, 58, 237, 0.3);
                    color: var(--text-white);
                    padding: 0 2px;
                    border-radius: 2px;
                `;
                const after = document.createTextNode(text.substring(index + query.length));

                fragment.appendChild(before);
                fragment.appendChild(highlight);
                fragment.appendChild(after);

                textNode.parentNode.replaceChild(fragment, textNode);
            }
        });
    }

    /**
     * Clear all search highlights
     */
    function clearHighlights(container) {
        const highlights = container.querySelectorAll('mark');
        highlights.forEach(function(mark) {
            const parent = mark.parentNode;
            const text = mark.textContent;
            const textNode = document.createTextNode(text);
            parent.replaceChild(textNode, mark);
            parent.normalize();
        });
    }

    // ============================================
    // 6. KEYBOARD SHORTCUTS
    // ============================================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Press 'D' to focus search
            if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                if (searchInput) {
                    e.preventDefault();
                    searchInput.focus();
                    searchInput.select();
                    if (window.VisionAI && window.VisionAI.Toast) {
                        window.VisionAI.Toast.info('🔍 Search focused');
                    }
                }
            }

            // Press 'S' to focus sidebar
            if ((e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const firstLink = document.querySelector('.docs-sidebar .docs-nav a');
                if (firstLink) {
                    e.preventDefault();
                    firstLink.focus();
                    if (window.VisionAI && window.VisionAI.Toast) {
                        window.VisionAI.Toast.info('📚 Sidebar focused');
                    }
                }
            }

            // Press 'T' to toggle TOC on mobile
            if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                if (window.innerWidth < 1024) {
                    const toggle = document.querySelector('.toc-toggle');
                    if (toggle) {
                        e.preventDefault();
                        toggle.click();
                        if (window.VisionAI && window.VisionAI.Toast) {
                            window.VisionAI.Toast.info('📖 TOC toggled');
                        }
                    }
                }
            }
        });
    }

    // ============================================
    // 7. SMOOTH SECTION SCROLL (Hash navigation)
    // ============================================

    function initHashNavigation() {
        // On page load, check for hash and scroll to section
        if (window.location.hash) {
            const target = document.querySelector(window.location.hash);
            if (target) {
                setTimeout(function() {
                    const navbarHeight = document.querySelector('#navbar')?.offsetHeight || 80;
                    const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });

                    // Update active nav link
                    navLinks.forEach(function(link) {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === window.location.hash) {
                            link.classList.add('active');
                        }
                    });
                }, 200);
            }
        }

        // Handle hash changes
        window.addEventListener('hashchange', function() {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const navbarHeight = document.querySelector('#navbar')?.offsetHeight || 80;
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    }

    // ============================================
    // 8. CODE BLOCK LINE NUMBERS (Optional enhancement)
    // ============================================

    function initCodeLineNumbers() {
        // This is a placeholder for future enhancement
        // Could add line numbers to code blocks
        console.log('Code line numbers feature ready.');
    }

    // ============================================
    // 9. EXPOSE PUBLIC API
    // ============================================

    window.DocsPage = {
        initNav: initSidebarNav,
        initCopy: initCodeCopy,
        initToc: initTocToggle,
        initSearch: initDocSearch,
        initShortcuts: initKeyboardShortcuts,
        initHash: initHashNavigation,
        initAll: function() {
            initSidebarNav();
            initCodeCopy();
            initTocToggle();
            initDocSearch();
            initKeyboardShortcuts();
            initHashNavigation();
        }
    };

    // ============================================
    // 10. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    DocsPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                DocsPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('Docs page module loaded.');

})();