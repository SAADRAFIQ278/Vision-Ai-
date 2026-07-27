/* ============================================
   VISIONAI - GLOBAL APPLICATION JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. UTILITY FUNCTIONS
    // ============================================

    /**
     * Debounce function to limit rate of execution
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function to limit rate of execution
     */
    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const context = this;
            const args = arguments;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(function() {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    /**
     * Get element by selector with error handling
     */
    function getElement(selector, context) {
        const ctx = context || document;
        const el = ctx.querySelector(selector);
        if (!el) {
            console.warn('Element not found:', selector);
        }
        return el;
    }

    /**
     * Get all elements by selector with error handling
     */
    function getElements(selector, context) {
        const ctx = context || document;
        const els = ctx.querySelectorAll(selector);
        if (els.length === 0) {
            console.warn('No elements found:', selector);
        }
        return els;
    }

    /**
     * Add event listener with safety
     */
    function on(el, event, handler) {
        if (el) {
            el.addEventListener(event, handler);
        }
        return el;
    }

    /**
     * Remove event listener with safety
     */
    function off(el, event, handler) {
        if (el) {
            el.removeEventListener(event, handler);
        }
        return el;
    }

    /**
     * Toggle class with safety
     */
    function toggleClass(el, className) {
        if (el) {
            el.classList.toggle(className);
        }
    }

    /**
     * Add class with safety
     */
    function addClass(el, className) {
        if (el) {
            el.classList.add(className);
        }
    }

    /**
     * Remove class with safety
     */
    function removeClass(el, className) {
        if (el) {
            el.classList.remove(className);
        }
    }

    /**
     * Check if element has class
     */
    function hasClass(el, className) {
        return el ? el.classList.contains(className) : false;
    }

    /**
     * Set attribute with safety
     */
    function setAttr(el, attr, value) {
        if (el) {
            el.setAttribute(attr, value);
        }
    }

    /**
     * Get attribute with safety
     */
    function getAttr(el, attr) {
        return el ? el.getAttribute(attr) : null;
    }

    /**
     * Create element with attributes
     */
    function createElement(tag, attributes, content) {
        const el = document.createElement(tag);
        if (attributes) {
            Object.keys(attributes).forEach(function(key) {
                el.setAttribute(key, attributes[key]);
            });
        }
        if (content !== undefined) {
            el.textContent = content;
        }
        return el;
    }

    /**
     * Generate a unique ID
     */
    function generateId(prefix) {
        return (prefix || 'id') + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    }

    // ============================================
    // 2. THEME / COLOR MODE
    // ============================================

    const ThemeManager = {
        current: 'dark',
        init: function() {
            // VisionAI uses dark theme exclusively as per design spec
            // But we provide a way to toggle if needed
            const saved = localStorage.getItem('visionai-theme');
            if (saved) {
                this.current = saved;
                this.applyTheme(saved);
            }
            // Listen for system preference changes
            this.listenForSystemChanges();
        },
        applyTheme: function(theme) {
            const html = document.documentElement;
            if (theme === 'light') {
                html.classList.add('light-theme');
                html.classList.remove('dark-theme');
            } else {
                html.classList.add('dark-theme');
                html.classList.remove('light-theme');
            }
            this.current = theme;
            localStorage.setItem('visionai-theme', theme);
        },
        toggle: function() {
            const newTheme = this.current === 'dark' ? 'light' : 'dark';
            this.applyTheme(newTheme);
            return newTheme;
        },
        listenForSystemChanges: function() {
            const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
            if (darkModeMedia) {
                darkModeMedia.addEventListener('change', function(e) {
                    // Only apply if user hasn't manually set a preference
                    if (!localStorage.getItem('visionai-theme')) {
                        ThemeManager.applyTheme(e.matches ? 'dark' : 'light');
                    }
                });
            }
        },
        isDark: function() {
            return this.current === 'dark';
        }
    };

    // ============================================
    // 3. PERFORMANCE MONITORING
    // ============================================

    const PerformanceMonitor = {
        marks: {},
        init: function() {
            // Mark initial load time
            this.mark('app-init');
        },
        mark: function(name) {
            if (window.performance && window.performance.mark) {
                window.performance.mark('visionai-' + name);
                this.marks[name] = performance.now();
            }
        },
        measure: function(name, startMark, endMark) {
            if (window.performance && window.performance.measure) {
                const measureName = 'visionai-' + name;
                const start = startMark ? 'visionai-' + startMark : undefined;
                const end = endMark ? 'visionai-' + endMark : undefined;
                window.performance.measure(measureName, start, end);
                const entries = window.performance.getEntriesByName(measureName);
                if (entries.length > 0) {
                    return entries[0].duration;
                }
            }
            return null;
        },
        logMeasure: function(name, startMark, endMark) {
            const duration = this.measure(name, startMark, endMark);
            if (duration !== null) {
                console.log('[Performance] ' + name + ': ' + duration.toFixed(2) + 'ms');
            }
            return duration;
        }
    };

    // ============================================
    // 4. RESIZE OBSERVER (for responsive adjustments)
    // ============================================

    const ResizeManager = {
        handlers: [],
        init: function() {
            this.debouncedResize = debounce(this.handleResize.bind(this), 150);
            window.addEventListener('resize', this.debouncedResize);
            // Also observe the body for size changes
            if (window.ResizeObserver) {
                this.observer = new ResizeObserver(this.debouncedResize);
                this.observer.observe(document.body);
            }
        },
        addHandler: function(fn) {
            if (typeof fn === 'function') {
                this.handlers.push(fn);
            }
        },
        handleResize: function() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            const breakpoint = this.getBreakpoint(width);
            this.handlers.forEach(function(fn) {
                try {
                    fn(width, height, breakpoint);
                } catch (e) {
                    console.warn('Resize handler error:', e);
                }
            });
        },
        getBreakpoint: function(width) {
            if (width < 481) return 'mobile-small';
            if (width < 769) return 'mobile';
            if (width < 1025) return 'tablet';
            if (width < 1281) return 'laptop';
            return 'desktop';
        },
        destroy: function() {
            window.removeEventListener('resize', this.debouncedResize);
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            this.handlers = [];
        }
    };

    // ============================================
    // 5. INTERSECTION OBSERVER (Unified)
    // ============================================

    const IntersectionManager = {
        observers: {},
        init: function() {
            this.revealObserver = this.createRevealObserver();
            this.lazyObserver = this.createLazyObserver();
        },
        createRevealObserver: function() {
            if (!('IntersectionObserver' in window)) return null;
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        // Check if it has data-reveal attribute
                        if (el.hasAttribute('data-reveal')) {
                            el.classList.add('revealed');
                        }
                        // Also handle any custom reveal logic
                        const event = new CustomEvent('element-revealed', {
                            detail: { element: el }
                        });
                        el.dispatchEvent(event);
                        // Optionally unobserve after reveal
                        if (el.dataset.revealOnce !== 'false') {
                            observer.unobserve(el);
                        }
                    }
                });
            }, {
                threshold: 0.10,
                rootMargin: '0px 0px -40px 0px'
            });
            return observer;
        },
        createLazyObserver: function() {
            if (!('IntersectionObserver' in window)) return null;
            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        // Lazy load images
                        if (el.tagName === 'IMG') {
                            const src = el.dataset.src || el.src;
                            if (el.dataset.src) {
                                el.src = src;
                            }
                            el.loading = 'lazy';
                        }
                        // Lazy load background images
                        if (el.dataset.bg) {
                            el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
                        }
                        // Lazy load videos
                        if (el.tagName === 'VIDEO' && el.dataset.src) {
                            const source = el.querySelector('source');
                            if (source) {
                                source.src = el.dataset.src;
                                el.load();
                            }
                        }
                        observer.unobserve(el);
                    }
                });
            }, {
                threshold: 0.01,
                rootMargin: '100px'
            });
            return observer;
        },
        observeReveal: function(el) {
            if (this.revealObserver && el) {
                // Check if already visible
                const rect = el.getBoundingClientRect();
                const winHeight = window.innerHeight || document.documentElement.clientHeight;
                if (rect.top < winHeight - 80) {
                    el.classList.add('revealed');
                } else {
                    this.revealObserver.observe(el);
                }
            }
        },
        observeLazy: function(el) {
            if (this.lazyObserver && el) {
                this.lazyObserver.observe(el);
            }
        },
        observeAll: function(context) {
            const ctx = context || document;
            // Data-reveal elements
            const revealEls = ctx.querySelectorAll('[data-reveal]');
            revealEls.forEach(function(el) {
                IntersectionManager.observeReveal(el);
            });
            // Lazy images
            const lazyImages = ctx.querySelectorAll('img[loading="lazy"], img[data-src]');
            lazyImages.forEach(function(img) {
                IntersectionManager.observeLazy(img);
            });
            // Lazy videos
            const lazyVideos = ctx.querySelectorAll('video[data-src]');
            lazyVideos.forEach(function(video) {
                IntersectionManager.observeLazy(video);
            });
            // Lazy backgrounds
            const lazyBg = ctx.querySelectorAll('[data-bg]');
            lazyBg.forEach(function(el) {
                IntersectionManager.observeLazy(el);
            });
        }
    };

    // ============================================
    // 6. KEYBOARD NAVIGATION HELPERS
    // ============================================

    const KeyboardManager = {
        init: function() {
            // Handle Escape key for modals
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    // Close any open modal
                    const openModal = document.querySelector('.video-modal.open');
                    if (openModal) {
                        const closeBtn = openModal.querySelector('.video-modal-close');
                        if (closeBtn) {
                            closeBtn.click();
                        }
                    }
                }
            });
            // Handle Tab key for focus management
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
                    // Update focus state for any focusable elements
                    document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])').forEach(function(el) {
                        if (el === document.activeElement) {
                            el.classList.add('focus-visible');
                        } else {
                            el.classList.remove('focus-visible');
                        }
                    });
                }
            });
        }
    };

    // ============================================
    // 7. TOAST SYSTEM (Global)
    // ============================================

    const ToastSystem = {
        toast: null,
        timeout: null,
        init: function() {
            this.toast = document.getElementById('toast');
            if (!this.toast) {
                // Create toast if not present
                this.toast = createElement('div', {
                    id: 'toast',
                    class: 'toast',
                    role: 'alert',
                    'aria-live': 'polite'
                });
                const icon = createElement('span', { class: 'toast-icon' }, '✓');
                const message = createElement('span', { class: 'toast-message' }, 'Action completed.');
                this.toast.appendChild(icon);
                this.toast.appendChild(message);
                document.body.appendChild(this.toast);
            }
        },
        show: function(message, type) {
            if (!this.toast) this.init();
            const msgEl = this.toast.querySelector('.toast-message');
            const iconEl = this.toast.querySelector('.toast-icon');
            if (msgEl) {
                msgEl.textContent = message || 'Action completed.';
            }
            if (iconEl) {
                if (type === 'error') {
                    iconEl.textContent = '✕';
                    iconEl.style.color = '#EF4444';
                } else if (type === 'warning') {
                    iconEl.textContent = '⚠';
                    iconEl.style.color = '#F59E0B';
                } else {
                    iconEl.textContent = '✓';
                    iconEl.style.color = '#10B981';
                }
            }
            this.toast.classList.add('show');
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(function() {
                ToastSystem.hide();
            }, 4000);
            return this;
        },
        hide: function() {
            if (this.toast) {
                this.toast.classList.remove('show');
            }
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }
            return this;
        },
        success: function(message) {
            return this.show(message, 'success');
        },
        error: function(message) {
            return this.show(message, 'error');
        },
        warning: function(message) {
            return this.show(message, 'warning');
        },
        info: function(message) {
            return this.show(message, 'info');
        }
    };

    // ============================================
    // 8. LOADER MANAGEMENT
    // ============================================

    const LoaderManager = {
        loader: null,
        init: function() {
            this.loader = document.getElementById('loader');
            if (this.loader) {
                // Auto-hide after page load
                window.addEventListener('load', function() {
                    setTimeout(function() {
                        LoaderManager.hide();
                    }, 400);
                });
            }
        },
        show: function() {
            if (this.loader) {
                this.loader.style.opacity = '1';
                this.loader.style.visibility = 'visible';
            }
            return this;
        },
        hide: function() {
            if (this.loader) {
                this.loader.style.opacity = '0';
                this.loader.style.visibility = 'hidden';
            }
            return this;
        },
        setText: function(text) {
            if (this.loader) {
                const textEl = this.loader.querySelector('.loader-text');
                if (textEl) {
                    textEl.textContent = text;
                }
            }
            return this;
        }
    };

    // ============================================
    // 9. SCROLL LOCK / UNLOCK
    // ============================================

    const ScrollLock = {
        locked: false,
        originalOverflow: '',
        lock: function() {
            if (!this.locked) {
                this.originalOverflow = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
                this.locked = true;
            }
        },
        unlock: function() {
            if (this.locked) {
                document.body.style.overflow = this.originalOverflow || '';
                this.locked = false;
            }
        },
        toggle: function() {
            if (this.locked) {
                this.unlock();
            } else {
                this.lock();
            }
        }
    };

    // ============================================
    // 10. NETWORK STATUS
    // ============================================

    const NetworkStatus = {
        online: navigator.onLine,
        init: function() {
            window.addEventListener('online', function() {
                NetworkStatus.online = true;
                ToastSystem.success('Back online!');
                document.dispatchEvent(new CustomEvent('visionai-online'));
            });
            window.addEventListener('offline', function() {
                NetworkStatus.online = false;
                ToastSystem.warning('You are offline. Some features may be unavailable.');
                document.dispatchEvent(new CustomEvent('visionai-offline'));
            });
        },
        isOnline: function() {
            return this.online;
        }
    };

    // ============================================
    // 11. EXPOSE GLOBALS
    // ============================================

    // Expose utilities globally
    window.VisionAI = {
        // Utilities
        debounce: debounce,
        throttle: throttle,
        getElement: getElement,
        getElements: getElements,
        on: on,
        off: off,
        addClass: addClass,
        removeClass: removeClass,
        toggleClass: toggleClass,
        hasClass: hasClass,
        setAttr: setAttr,
        getAttr: getAttr,
        createElement: createElement,
        generateId: generateId,

        // Managers
        Theme: ThemeManager,
        Performance: PerformanceMonitor,
        Resize: ResizeManager,
        Intersection: IntersectionManager,
        Keyboard: KeyboardManager,
        Toast: ToastSystem,
        Loader: LoaderManager,
        ScrollLock: ScrollLock,
        Network: NetworkStatus,

        // Version
        version: '1.0.0'
    };

    // ============================================
    // 12. INITIALIZE
    // ============================================

    function init() {
        // Mark start
        PerformanceMonitor.mark('init-start');

        // Initialize managers
        ThemeManager.init();
        ResizeManager.init();
        IntersectionManager.init();
        KeyboardManager.init();
        ToastSystem.init();
        LoaderManager.init();
        NetworkStatus.init();

        // Observe all reveal elements
        IntersectionManager.observeAll();

        // Mark init complete
        PerformanceMonitor.mark('init-end');
        PerformanceMonitor.logMeasure('Total Init', 'init-start', 'init-end');

        console.log('VisionAI v1.0.0 initialized successfully.');
        console.log('🌙 Dark theme, glassmorphism, premium UI ready.');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also run on full load for any post-load tasks
    window.addEventListener('load', function() {
        PerformanceMonitor.mark('full-load');
        // Any additional post-load tasks
        console.log('VisionAI fully loaded.');
    });

})();