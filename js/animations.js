/* ============================================
   VISIONAI - ANIMATIONS JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. SCROLL REVEAL (Intersection Observer)
    // ============================================

    /**
     * Initialize scroll reveal animations
     * Uses data-reveal attribute on elements
     */
    function initScrollReveal() {
        if (!('IntersectionObserver' in window)) {
            // Fallback: reveal all elements immediately
            document.querySelectorAll('[data-reveal]').forEach(function(el) {
                el.classList.add('revealed');
            });
            return;
        }

        const revealElements = document.querySelectorAll('[data-reveal]');
        if (revealElements.length === 0) return;

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    // Check if there's a specific delay
                    const delay = parseInt(el.getAttribute('data-delay')) || 0;
                    setTimeout(function() {
                        el.classList.add('revealed');
                    }, delay);
                    // Unobserve after revealing unless data-reveal-once="false"
                    if (el.getAttribute('data-reveal-once') !== 'false') {
                        observer.unobserve(el);
                    }
                }
            });
        }, {
            threshold: 0.10,
            rootMargin: '0px 0px -30px 0px'
        });

        revealElements.forEach(function(el) {
            // Set initial state via CSS is handled in animations.css
            observer.observe(el);
        });

        console.log('Scroll reveal initialized with', revealElements.length, 'elements.');
    }

    // ============================================
    // 2. COUNTER ANIMATION
    // ============================================

    /**
     * Animate number counters using Intersection Observer
     * Elements with data-count attribute
     */
    function initCounterAnimation() {
        const counters = document.querySelectorAll('[data-count]');
        if (counters.length === 0) return;

        let countersAnimated = false;

        function animateCounter(el) {
            const target = parseFloat(el.getAttribute('data-count'));
            const isDecimal = target % 1 !== 0;
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = eased * target;

                if (isDecimal) {
                    el.textContent = current.toFixed(1);
                } else {
                    el.textContent = Math.floor(current);
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    // Final value
                    if (isDecimal) {
                        el.textContent = target.toFixed(1);
                    } else {
                        el.textContent = target;
                    }
                    // Add a small pop effect
                    el.classList.add('counter-pop');
                    setTimeout(function() {
                        el.classList.remove('counter-pop');
                    }, 500);
                }
            }
            requestAnimationFrame(updateCounter);
        }

        function startCounters() {
            if (countersAnimated) return;
            countersAnimated = true;

            counters.forEach(function(counter) {
                // Check if already visible
                const rect = counter.getBoundingClientRect();
                const winHeight = window.innerHeight || document.documentElement.clientHeight;
                if (rect.top < winHeight - 50) {
                    animateCounter(counter);
                } else {
                    // Use intersection observer for those not visible yet
                    const observer = new IntersectionObserver(function(entries) {
                        entries.forEach(function(entry) {
                            if (entry.isIntersecting) {
                                animateCounter(counter);
                                observer.unobserve(counter);
                            }
                        });
                    }, { threshold: 0.3 });
                    observer.observe(counter);
                }
            });
        }

        // Use Intersection Observer to start counters when any counter is visible
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !countersAnimated) {
                    startCounters();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.1 });

        // Observe the first counter (or any container that holds them)
        const firstCounter = counters[0];
        if (firstCounter) {
            // Find the nearest section container
            const container = firstCounter.closest('section') || firstCounter.closest('.container') || document.body;
            observer.observe(container);
        }

        // Fallback: start after 2 seconds if no intersection
        setTimeout(function() {
            if (!countersAnimated) {
                startCounters();
            }
        }, 3000);

        console.log('Counter animation initialized with', counters.length, 'counters.');
    }

    // ============================================
    // 3. PARALLAX SCROLL EFFECT (Optional)
    // ============================================

    /**
     * Simple parallax effect for background elements
     * Elements with data-parallax attribute
     */
    function initParallax() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        if (parallaxElements.length === 0) return;

        let ticking = false;

        function updateParallax() {
            const scrollY = window.scrollY;
            parallaxElements.forEach(function(el) {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.5;
                const rect = el.getBoundingClientRect();
                // Only animate if element is in viewport
                if (rect.top < window.innerHeight + 200 && rect.bottom > -200) {
                    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
                    el.style.transform = 'translateY(' + (offset * 0.1) + 'px)';
                }
            });
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });

        // Initial update
        updateParallax();

        console.log('Parallax initialized with', parallaxElements.length, 'elements.');
    }

    // ============================================
    // 4. STAGGER ANIMATIONS FOR GRIDS
    // ============================================

    /**
     * Stagger children of a container with data-stagger attribute
     * Each child gets a delay based on its index
     */
    function initStagger() {
        const containers = document.querySelectorAll('[data-stagger]');
        if (containers.length === 0) return;

        containers.forEach(function(container) {
            const children = container.children;
            const delayBase = parseInt(container.getAttribute('data-stagger-delay')) || 50;
            const maxDelay = parseInt(container.getAttribute('data-stagger-max')) || 400;

            Array.from(children).forEach(function(child, index) {
                const delay = Math.min(index * delayBase, maxDelay);
                child.style.transitionDelay = delay + 'ms';
                // Add data-reveal attribute if not already present
                if (!child.hasAttribute('data-reveal')) {
                    child.setAttribute('data-reveal', '');
                    // Set initial state
                    child.style.opacity = '0';
                    child.style.transform = 'translateY(30px) scale(0.98)';
                    child.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                }
            });
        });

        console.log('Stagger animation initialized.');
    }

    // ============================================
    // 5. SMOOTH SCROLL TO ANCHOR
    // ============================================

    /**
     * Smooth scroll to anchor links with offset for fixed navbar
     */
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
            const href = anchor.getAttribute('href');
            if (href === '#' || href === '#!') return;

            anchor.addEventListener('click', function(e) {
                const targetId = href;
                const target = document.querySelector(targetId);
                if (!target) return;

                e.preventDefault();
                const navbarHeight = document.querySelector('#navbar') ? 
                    document.querySelector('#navbar').offsetHeight : 80;
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 10;

                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Update URL without scrolling
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            });
        });

        console.log('Smooth scroll initialized.');
    }

    // ============================================
    // 6. TYPING EFFECT (Optional)
    // ============================================

    /**
     * Simple typing effect for elements with data-typing
     * Usage: <span data-typing="Hello World" data-typing-speed="50"></span>
     */
    function initTyping() {
        const elements = document.querySelectorAll('[data-typing]');
        if (elements.length === 0) return;

        elements.forEach(function(el) {
            const text = el.getAttribute('data-typing') || el.textContent.trim();
            const speed = parseInt(el.getAttribute('data-typing-speed')) || 60;
            const delay = parseInt(el.getAttribute('data-typing-delay')) || 500;

            if (!text) return;

            // Clear content
            el.textContent = '';

            let index = 0;
            let char = '';

            function typeChar() {
                if (index < text.length) {
                    char = text.charAt(index);
                    el.textContent += char;
                    index++;
                    setTimeout(typeChar, speed);
                } else {
                    // Add cursor blink effect
                    el.classList.add('typing-cursor');
                }
            }

            // Start after delay
            setTimeout(typeChar, delay);
        });

        console.log('Typing effect initialized with', elements.length, 'elements.');
    }

    // ============================================
    // 7. HOVER ANIMATION CLEANUP (for performance)
    // ============================================

    /**
     * Use CSS for hover effects, but we can add a class for JS-based hover
     * Not needed for now
     */

    // ============================================
    // 8. ANIMATION ON PAGE LOAD
    // ============================================

    /**
     * Add entrance animations to hero elements
     */
    function initPageEntrance() {
        // Add fade-in-up to hero elements with delay
        const hero = document.querySelector('.hero');
        if (hero) {
            const children = hero.querySelectorAll('.hero-title, .hero-desc, .hero-actions, .hero-stats');
            children.forEach(function(child, index) {
                child.classList.add('fade-in-up');
                child.style.animationDelay = (0.2 + index * 0.15) + 's';
                child.style.opacity = '0';
                child.style.animationFillMode = 'forwards';
            });
        }

        // Add entrance to section headers
        document.querySelectorAll('.section-header').forEach(function(header, index) {
            header.classList.add('fade-in-up');
            header.style.animationDelay = (0.1 + index * 0.1) + 's';
            header.style.opacity = '0';
            header.style.animationFillMode = 'forwards';
        });

        console.log('Page entrance animations initialized.');
    }

    // ============================================
    // 9. PUBLIC API
    // ============================================

    window.Animations = {
        initScrollReveal: initScrollReveal,
        initCounter: initCounterAnimation,
        initParallax: initParallax,
        initStagger: initStagger,
        initSmoothScroll: initSmoothScroll,
        initTyping: initTyping,
        initEntrance: initPageEntrance,
        // Re-run all animations
        initAll: function() {
            initPageEntrance();
            initScrollReveal();
            initCounterAnimation();
            initParallax();
            initStagger();
            initSmoothScroll();
            initTyping();
        }
    };

    // ============================================
    // 10. INITIALIZE
    // ============================================

    function init() {
        // Run entrance animations first
        initPageEntrance();

        // Run scroll reveal after a short delay to let page load
        setTimeout(function() {
            initScrollReveal();
            initCounterAnimation();
            initStagger();
            initSmoothScroll();
            initTyping();

            // Parallax after everything else
            setTimeout(initParallax, 100);
        }, 300);

        console.log('Animations module initialized.');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Also re-run on ajax page loads if needed (for SPAs)
    document.addEventListener('visionai-page-loaded', function() {
        // Re-run animations on new content
        initScrollReveal();
        initCounterAnimation();
        initStagger();
        initTyping();
    });

})();