/* ============================================
   VISIONAI - TESTIMONIAL SLIDER JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. DOM REFERENCES
    // ============================================

    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('sliderDots');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const sliderContainer = document.querySelector('.testimonial-slider');

    // ============================================
    // 2. SLIDER STATE
    // ============================================

    let currentSlide = 0;
    let slideCount = 0;
    let autoSlideInterval = null;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;

    // ============================================
    // 3. SLIDER FUNCTIONS
    // ============================================

    /**
     * Initialize slider with testimonial cards
     */
    function initSlider() {
        if (!track) return;

        const cards = track.querySelectorAll('.testimonial-card');
        slideCount = cards.length;

        if (slideCount === 0) {
            console.warn('No testimonial cards found.');
            return;
        }

        // Set up the track width for proper sliding
        track.style.display = 'flex';
        track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        // Create dots
        createDots();

        // Set initial position
        goToSlide(0, false);

        // Set up event listeners
        setupEventListeners();

        // Start auto-slide
        startAutoSlide();

        console.log('Testimonial slider initialized with ' + slideCount + ' slides.');
    }

    /**
     * Create navigation dots
     */
    function createDots() {
        if (!dotsContainer) return;

        dotsContainer.innerHTML = '';

        for (let i = 0; i < slideCount; i++) {
            const dot = document.createElement('button');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
            dot.setAttribute('data-index', i);
            dot.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        }
    }

    /**
     * Go to a specific slide
     */
    function goToSlide(index, animate = true) {
        if (isTransitioning) return;
        if (slideCount === 0) return;

        // Handle wrapping
        if (index < 0) index = slideCount - 1;
        if (index >= slideCount) index = 0;

        // Don't do anything if already at the target slide
        if (index === currentSlide && animate) return;

        isTransitioning = true;
        currentSlide = index;

        // Move the track
        if (!animate) {
            track.style.transition = 'none';
        } else {
            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }

        track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';

        // Force reflow for non-animated transitions
        if (!animate) {
            void track.offsetHeight;
            track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }

        // Update dots
        updateDots();

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('slide-change', {
            detail: {
                currentSlide: currentSlide,
                totalSlides: slideCount
            }
        }));

        // Reset transition flag after animation
        setTimeout(function() {
            isTransitioning = false;
        }, 550);
    }

    /**
     * Update active dot
     */
    function updateDots() {
        if (!dotsContainer) return;

        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach(function(dot, index) {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    /**
     * Go to next slide
     */
    function nextSlide() {
        if (isTransitioning) return;
        goToSlide(currentSlide + 1);
    }

    /**
     * Go to previous slide
     */
    function prevSlide() {
        if (isTransitioning) return;
        goToSlide(currentSlide - 1);
    }

    // ============================================
    // 4. AUTO-PLAY
    // ============================================

    function startAutoSlide() {
        stopAutoSlide();
        if (slideCount > 1) {
            autoSlideInterval = setInterval(nextSlide, 5000);
        }
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    function resetAutoSlide() {
        startAutoSlide();
    }

    // ============================================
    // 5. EVENT LISTENERS
    // ============================================

    function setupEventListeners() {
        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                prevSlide();
                resetAutoSlide();
            });
        }

        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                nextSlide();
                resetAutoSlide();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            const isSliderVisible = sliderContainer && isElementInViewport(sliderContainer);
            if (!isSliderVisible) return;

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlide();
                resetAutoSlide();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlide();
                resetAutoSlide();
            }
        });

        // Touch support
        if (track) {
            track.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                isDragging = true;
                stopAutoSlide();
            }, { passive: true });

            track.addEventListener('touchmove', function(e) {
                if (!isDragging) return;
                // Optional: add drag feedback here
            }, { passive: true });

            track.addEventListener('touchend', function(e) {
                if (!isDragging) return;
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                const threshold = 30;

                if (Math.abs(diff) > threshold) {
                    if (diff > 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                    resetAutoSlide();
                } else {
                    // If swipe was small, just restart auto-slide
                    startAutoSlide();
                }

                isDragging = false;
            }, { passive: true });

            // Mouse drag support for desktop
            let mouseDown = false;
            let mouseStartX = 0;

            track.addEventListener('mousedown', function(e) {
                if (e.button === 0) {
                    mouseDown = true;
                    mouseStartX = e.screenX;
                    stopAutoSlide();
                    track.style.cursor = 'grabbing';
                }
            });

            document.addEventListener('mousemove', function(e) {
                if (!mouseDown) return;
                // Optional drag feedback
            });

            document.addEventListener('mouseup', function(e) {
                if (!mouseDown) return;
                const diff = mouseStartX - e.screenX;
                const threshold = 30;

                if (Math.abs(diff) > threshold) {
                    if (diff > 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                    resetAutoSlide();
                } else {
                    startAutoSlide();
                }

                mouseDown = false;
                track.style.cursor = '';
            });
        }

        // Pause on hover (desktop)
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', function() {
                stopAutoSlide();
            });

            sliderContainer.addEventListener('mouseleave', function() {
                startAutoSlide();
            });

            // Pause when user is interacting with dots or buttons
            const interactiveElements = sliderContainer.querySelectorAll('.slider-btn, .dot');
            interactiveElements.forEach(function(el) {
                el.addEventListener('mouseenter', function() {
                    stopAutoSlide();
                });
                el.addEventListener('mouseleave', function() {
                    startAutoSlide();
                });
            });
        }

        // Handle visibility change - pause when tab is hidden
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                stopAutoSlide();
            } else {
                startAutoSlide();
            }
        });

        // Handle resize - recalculate if needed
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                // Re-position current slide after resize
                if (track) {
                    track.style.transition = 'none';
                    track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
                    void track.offsetHeight;
                    track.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }
            }, 200);
        }, { passive: true });
    }

    // ============================================
    // 6. HELPER FUNCTIONS
    // ============================================

    /**
     * Check if an element is visible in the viewport
     */
    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ============================================
    // 7. PUBLIC API
    // ============================================

    window.Slider = {
        goTo: goToSlide,
        next: nextSlide,
        prev: prevSlide,
        getCurrent: function() { return currentSlide; },
        getTotal: function() { return slideCount; },
        start: startAutoSlide,
        stop: stopAutoSlide,
        reset: resetAutoSlide,
        destroy: function() {
            stopAutoSlide();
            if (prevBtn) {
                prevBtn.removeEventListener('click', prevSlide);
            }
            if (nextBtn) {
                nextBtn.removeEventListener('click', nextSlide);
            }
            // Clean up dots
            if (dotsContainer) {
                dotsContainer.innerHTML = '';
            }
            // Reset track
            if (track) {
                track.style.transition = 'none';
                track.style.transform = 'translateX(0)';
            }
            console.log('Slider destroyed.');
        }
    };

    // ============================================
    // 8. INITIALIZE
    // ============================================

    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initSlider, 50);
            });
        } else {
            setTimeout(initSlider, 50);
        }
    }

    // Start initialization
    init();

    console.log('Testimonial slider module loaded.');

})();