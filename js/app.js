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
    // 2. THEME / COLOR MODE (Dark only - premium)
    // ============================================

    const ThemeManager = {
        current: 'dark',
        init: function() {
            // VisionAI uses dark theme exclusively as per design spec
            // But we provide a way to toggle if needed (hidden feature)
            const saved = localStorage.getItem('visionai-theme');
            if (saved && saved === 'light') {
                this.current = 'light';
                this.applyTheme('light');
            } else {
                this.applyTheme('dark');
            }
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
    // 4. RESIZE OBSERVER
    // ============================================

    const ResizeManager = {
        handlers: [],
        init: function() {
            this.debouncedResize = debounce(this.handleResize.bind(this), 150);
            window.addEventListener('resize', this.debouncedResize);
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
    // 5. INTERSECTION OBSERVER
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
                        if (el.hasAttribute('data-reveal')) {
                            el.classList.add('revealed');
                        }
                        const event = new CustomEvent('element-revealed', {
                            detail: { element: el }
                        });
                        el.dispatchEvent(event);
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
                        if (el.tagName === 'IMG') {
                            const src = el.dataset.src || el.src;
                            if (el.dataset.src) {
                                el.src = src;
                            }
                            el.loading = 'lazy';
                        }
                        if (el.dataset.bg) {
                            el.style.backgroundImage = 'url(' + el.dataset.bg + ')';
                        }
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
            const revealEls = ctx.querySelectorAll('[data-reveal]');
            revealEls.forEach(function(el) {
                IntersectionManager.observeReveal(el);
            });
            const lazyImages = ctx.querySelectorAll('img[loading="lazy"], img[data-src]');
            lazyImages.forEach(function(img) {
                IntersectionManager.observeLazy(img);
            });
            const lazyVideos = ctx.querySelectorAll('video[data-src]');
            lazyVideos.forEach(function(video) {
                IntersectionManager.observeLazy(video);
            });
            const lazyBg = ctx.querySelectorAll('[data-bg]');
            lazyBg.forEach(function(el) {
                IntersectionManager.observeLazy(el);
            });
        }
    };

    // ============================================
    // 6. KEYBOARD NAVIGATION
    // ============================================

    const KeyboardManager = {
        init: function() {
            // Global Escape handler for modals
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    // Close video modal
                    const openModal = document.querySelector('.video-modal.open');
                    if (openModal) {
                        const closeBtn = openModal.querySelector('.video-modal-close');
                        if (closeBtn) closeBtn.click();
                    }
                    // Close template preview modal
                    const previewModal = document.querySelector('.template-preview-modal.open');
                    if (previewModal) {
                        const closeBtn = previewModal.querySelector('.template-preview-close');
                        if (closeBtn) closeBtn.click();
                    }
                }
            });

            // Focus management for Tab key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Tab') {
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
    // 7. TOAST SYSTEM
    // ============================================

    const ToastSystem = {
        toast: null,
        timeout: null,
        init: function() {
            this.toast = document.getElementById('toast');
            if (!this.toast) {
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
                window.addEventListener('load', function() {
                    setTimeout(function() {
                        LoaderManager.hide();
                    }, 500);
                });
            }
        },
        show: function() {
            if (this.loader) {
                this.loader.classList.remove('hidden');
            }
            return this;
        },
        hide: function() {
            if (this.loader) {
                this.loader.classList.add('hidden');
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
    // 9. SCROLL LOCK
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
    // 11. CURSOR GLOW
    // ============================================

    const CursorGlow = {
        element: null,
        init: function() {
            this.element = document.getElementById('cursorGlow');
            if (!this.element) return;

            // Only enable on desktop
            if (window.innerWidth < 1025) {
                this.element.style.display = 'none';
                return;
            }

            document.addEventListener('mousemove', function(e) {
                const x = e.clientX;
                const y = e.clientY;
                CursorGlow.element.style.left = x + 'px';
                CursorGlow.element.style.top = y + 'px';
            });

            document.addEventListener('mouseleave', function() {
                CursorGlow.element.style.opacity = '0';
            });

            document.addEventListener('mouseenter', function() {
                CursorGlow.element.style.opacity = '1';
            });
        }
    };

    // ============================================
    // 12. SKELETON LOADER
    // ============================================

    const SkeletonLoader = {
        init: function() {
            // Add skeleton loading for images that are being lazy loaded
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(function(img) {
                // Add skeleton class before load
                img.classList.add('skeleton');
                img.addEventListener('load', function() {
                    this.classList.remove('skeleton');
                });
                img.addEventListener('error', function() {
                    this.classList.remove('skeleton');
                });
            });
        }
    };

    // ============================================
    // 13. PARALLAX EFFECT
    // ============================================

    const ParallaxManager = {
        elements: [],
        init: function() {
            this.elements = document.querySelectorAll('[data-parallax-speed]');
            if (this.elements.length === 0) return;

            this.throttledUpdate = throttle(this.update.bind(this), 10);
            window.addEventListener('scroll', this.throttledUpdate, { passive: true });
            this.update();
        },
        update: function() {
            const scrollY = window.scrollY;
            this.elements.forEach(function(el) {
                const speed = parseFloat(el.getAttribute('data-parallax-speed')) || 0.3;
                const rect = el.getBoundingClientRect();
                const viewportHeight = window.innerHeight;

                // Only animate if element is in or near viewport
                if (rect.top < viewportHeight + 200 && rect.bottom > -200) {
                    const offset = (rect.top - viewportHeight / 2) * speed;
                    el.style.transform = 'translateY(' + offset + 'px)';
                }
            });
        },
        destroy: function() {
            window.removeEventListener('scroll', this.throttledUpdate);
        }
    };

    // ============================================
    // 14. RIPPLE EFFECT (Global)
    // ============================================

    const RippleManager = {
        init: function() {
            document.addEventListener('click', function(e) {
                const btn = e.target.closest('.btn, .faq-question, .template-play-btn, .demo-play-btn');
                if (btn) {
                    RippleManager.createRipple(e, btn);
                }
            });
        },
        createRipple: function(e, element) {
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            element.appendChild(ripple);
            setTimeout(function() {
                ripple.remove();
            }, 700);
        }
    };

    // ============================================
    // 15. EXPOSE GLOBALS
    // ============================================

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
        Cursor: CursorGlow,
        Skeleton: SkeletonLoader,
        Parallax: ParallaxManager,
        Ripple: RippleManager,

        // Version
        version: '3.0.0'
    };

    // ============================================
    // 16. INITIALIZE
    // ============================================

    function init() {
        PerformanceMonitor.mark('init-start');

        ThemeManager.init();
        ResizeManager.init();
        IntersectionManager.init();
        KeyboardManager.init();
        ToastSystem.init();
        LoaderManager.init();
        NetworkStatus.init();
        CursorGlow.init();
        SkeletonLoader.init();
        ParallaxManager.init();
        RippleManager.init();

        // Observe all reveal elements
        IntersectionManager.observeAll();

        PerformanceMonitor.mark('init-end');
        PerformanceMonitor.logMeasure('Total Init', 'init-start', 'init-end');

        console.log('VisionAI v3.0.0 initialized successfully.');
        console.log('🌙 Premium dark theme • Glassmorphism • AI Video Generator');
        console.log('🚀 Ready to create cinematic AI videos.');
        console.log('✨ Features: Parallax • Ripple • Cursor Glow • Scroll Reveal');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('load', function() {
        PerformanceMonitor.mark('full-load');
        console.log('VisionAI fully loaded.');
    });

})();