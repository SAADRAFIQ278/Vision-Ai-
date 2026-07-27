/* ============================================
   VISIONAI - HOME PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. LOADER
    // ============================================
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                loader.style.opacity = '0';
                loader.style.visibility = 'hidden';
                loader.style.transition = 'opacity 0.6s ease, visibility 0.6s ease';
            }, 400);
        });
    }

    // ============================================
    // 2. STICKY NAVBAR & SCROLL PROGRESS
    // ============================================
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('scroll-progress');
    let lastScrollY = 0;

    function updateNavbar() {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScrollY = currentScrollY;

        // Scroll progress
        if (progressBar) {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
            progressBar.setAttribute('aria-valuenow', Math.round(progress));
        }
    }

    window.addEventListener('scroll', updateNavbar, { passive: true });
    window.addEventListener('resize', updateNavbar, { passive: true });
    updateNavbar();

    // ============================================
    // 3. MOBILE MENU (HAMBURGER)
    // ============================================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
            this.setAttribute('aria-expanded', expanded);
            navLinks.classList.toggle('open');
            body.classList.toggle('menu-open');
        });

        // Close menu on link click (mobile)
        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
            });
        });

        // Close on outside click
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('open')) {
                if (!navbar.contains(e.target)) {
                    navLinks.classList.remove('open');
                    hamburger.setAttribute('aria-expanded', 'false');
                    body.classList.remove('menu-open');
                }
            }
        });
    }

    // ============================================
    // 4. SMOOTH SCROLL (for internal anchor links)
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // 5. BACK TO TOP
    // ============================================
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });

        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // 6. COUNTER ANIMATION (Intersection Observer)
    // ============================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;

        statNumbers.forEach(function(el) {
            const target = parseFloat(el.getAttribute('data-count'));
            const isDecimal = target % 1 !== 0;
            const duration = 2000;
            const startTime = performance.now();

            function updateCounter(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
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
                    if (isDecimal) {
                        el.textContent = target.toFixed(1);
                    } else {
                        el.textContent = target;
                    }
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    // Intersection Observer for counters
    if ('IntersectionObserver' in window && statNumbers.length > 0) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });
        const statsContainer = document.querySelector('.hero-stats');
        if (statsContainer) {
            observer.observe(statsContainer);
        }
    } else {
        // Fallback: animate after 2s
        setTimeout(animateCounters, 1500);
    }

    // ============================================
    // 7. FAQ ACCORDION
    // ============================================
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;

                // Close all other items (optional: to keep only one open)
                faqItems.forEach(function(otherItem) {
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    if (otherQuestion && otherQuestion !== question) {
                        otherQuestion.setAttribute('aria-expanded', 'false');
                    }
                });

                this.setAttribute('aria-expanded', expanded);
            });
        }
    });

    // ============================================
    // 8. TESTIMONIAL SLIDER
    // ============================================
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('sliderDots');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    let currentSlide = 0;
    let slideCount = 0;
    let autoSlideInterval = null;

    if (track) {
        const cards = track.querySelectorAll('.testimonial-card');
        slideCount = cards.length;

        if (slideCount > 0) {
            // Create dots
            if (dotsContainer) {
                dotsContainer.innerHTML = '';
                for (let i = 0; i < slideCount; i++) {
                    const dot = document.createElement('button');
                    dot.classList.add('dot');
                    if (i === 0) dot.classList.add('active');
                    dot.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
                    dot.addEventListener('click', function() {
                        goToSlide(i);
                    });
                    dotsContainer.appendChild(dot);
                }
            }

            function goToSlide(index) {
                if (index < 0) index = slideCount - 1;
                if (index >= slideCount) index = 0;
                currentSlide = index;
                track.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';

                // Update dots
                if (dotsContainer) {
                    const dots = dotsContainer.querySelectorAll('.dot');
                    dots.forEach(function(dot, i) {
                        dot.classList.toggle('active', i === currentSlide);
                    });
                }
            }

            function nextSlide() {
                goToSlide(currentSlide + 1);
            }

            function prevSlide() {
                goToSlide(currentSlide - 1);
            }

            if (prevBtn) prevBtn.addEventListener('click', prevSlide);
            if (nextBtn) nextBtn.addEventListener('click', nextSlide);

            // Auto-slide
            function startAutoSlide() {
                if (autoSlideInterval) clearInterval(autoSlideInterval);
                autoSlideInterval = setInterval(nextSlide, 5000);
            }

            function stopAutoSlide() {
                if (autoSlideInterval) {
                    clearInterval(autoSlideInterval);
                    autoSlideInterval = null;
                }
            }

            startAutoSlide();

            // Pause on hover
            const slider = document.querySelector('.testimonial-slider');
            if (slider) {
                slider.addEventListener('mouseenter', stopAutoSlide);
                slider.addEventListener('mouseleave', startAutoSlide);
            }

            // Keyboard navigation
            document.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowLeft' && prevBtn) prevSlide();
                if (e.key === 'ArrowRight' && nextBtn) nextSlide();
            });

            // Touch support
            let touchStartX = 0;
            let touchEndX = 0;
            track.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            track.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) nextSlide();
                    else prevSlide();
                }
            }, { passive: true });
        }
    }

    // ============================================
    // 9. VIDEO MODAL (Demo play button)
    // ============================================
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalClose = document.querySelector('.video-modal-close');
    const demoPlayBtn = document.querySelector('.demo-play-btn');

    function openVideoModal(src) {
        if (!modal || !modalVideo) return;
        if (src) {
            modalVideo.querySelector('source').src = src;
            modalVideo.load();
        }
        modal.classList.add('open');
        modalVideo.play().catch(function() { /* ignore autoplay errors */ });
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        if (!modal || !modalVideo) return;
        modal.classList.remove('open');
        modalVideo.pause();
        modalVideo.currentTime = 0;
        document.body.style.overflow = '';
    }

    if (demoPlayBtn) {
        demoPlayBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const videoElement = document.querySelector('.demo-video');
            let videoSrc = '';
            if (videoElement) {
                const source = videoElement.querySelector('source');
                if (source) videoSrc = source.src;
            }
            if (!videoSrc) {
                // Fallback demo video (replace with a real free video URL if needed)
                videoSrc = 'https://assets.mixkit.co/videos/preview/mixkit-technology-ai-...';
            }
            openVideoModal(videoSrc);
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeVideoModal);
    }

    // Close modal on overlay click
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeVideoModal();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeVideoModal();
        }
    });

    // ============================================
    // 10. TOAST NOTIFICATION
    // ============================================
    const toast = document.getElementById('toast');
    let toastTimeout = null;

    window.showToast = function(message, type) {
        if (!toast) return;
        const msgEl = toast.querySelector('.toast-message');
        const iconEl = toast.querySelector('.toast-icon');
        if (msgEl) msgEl.textContent = message || 'Action completed.';
        if (iconEl) {
            if (type === 'error') {
                iconEl.textContent = '✕';
                iconEl.style.color = '#EF4444';
            } else {
                iconEl.textContent = '✓';
                iconEl.style.color = '#10B981';
            }
        }
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function() {
            toast.classList.remove('show');
        }, 4000);
    };

    // ============================================
    // 11. BUTTON RIPPLE EFFECT
    // ============================================
    document.querySelectorAll('.btn, .demo-play-btn, .slider-btn, .faq-question').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple-effect');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255,255,255,0.25)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple-anim 0.6s ease-out forwards';
            ripple.style.pointerEvents = 'none';
            this.appendChild(ripple);
            setTimeout(function() {
                ripple.remove();
            }, 700);
        });
    });

    // Inject ripple keyframes if not present
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple-anim {
                0% { transform: scale(0); opacity: 0.7; }
                100% { transform: scale(2.5); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // 12. FAKE AI RENDERING (Demo status animation)
    // ============================================
    const demoStatus = document.querySelector('.demo-status');
    if (demoStatus) {
        const statusTexts = [
            '◆ AI Analyzing prompt...',
            '◆ AI Generating frames...',
            '◆ AI Rendering video...',
            '◆ AI Finalizing...'
        ];
        let statusIndex = 0;

        function cycleStatus() {
            statusIndex = (statusIndex + 1) % statusTexts.length;
            demoStatus.textContent = statusTexts[statusIndex];
        }
        setInterval(cycleStatus, 3000);
    }

    // ============================================
    // 13. FORM VALIDATION (Newsletter)
    // ============================================
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterMessage = document.getElementById('newsletterMessage');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = this.querySelector('input[type="email"]');
            const email = input ? input.value.trim() : '';

            if (!email) {
                if (newsletterMessage) {
                    newsletterMessage.textContent = 'Please enter your email address.';
                    newsletterMessage.style.color = '#EF4444';
                }
                return;
            }

            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(email)) {
                if (newsletterMessage) {
                    newsletterMessage.textContent = 'Please enter a valid email address.';
                    newsletterMessage.style.color = '#EF4444';
                }
                return;
            }

            // Success
            if (newsletterMessage) {
                newsletterMessage.textContent = '✅ Subscribed successfully! Check your inbox.';
                newsletterMessage.style.color = '#10B981';
            }
            if (input) input.value = '';
            window.showToast('Subscribed successfully!', 'success');
        });
    }

    // ============================================
    // 14. INTERSECTION OBSERVER - SCROLL REVEAL
    // ============================================
    if ('IntersectionObserver' in window) {
        const revealElements = document.querySelectorAll('[data-reveal]');
        const revealObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Optionally stop observing after reveal
                    // revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.10,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(function(el) {
            // Add initial hidden state via CSS (if not already)
            if (!el.classList.contains('revealed')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px)';
                el.style.transition = 'opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                // Add a small delay if data-delay attribute exists
                const delay = el.getAttribute('data-delay');
                if (delay) {
                    el.style.transitionDelay = delay + 'ms';
                }
            }
            revealObserver.observe(el);
        });

        // When revealed, apply styles
        document.addEventListener('DOMContentLoaded', function() {
            // Use a mutation observer or just rely on the class toggle
        });

        // Override the revealed class to set final styles
        const origReveal = revealObserver;
        // We'll add a style for .revealed
        const revealStyle = document.createElement('style');
        revealStyle.textContent = `
            [data-reveal].revealed {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(revealStyle);

        // Also handle elements that might already be visible on load
        setTimeout(function() {
            revealElements.forEach(function(el) {
                const rect = el.getBoundingClientRect();
                const winHeight = window.innerHeight || document.documentElement.clientHeight;
                if (rect.top < winHeight - 80) {
                    el.classList.add('revealed');
                }
            });
        }, 200);
    } else {
        // Fallback: show all
        document.querySelectorAll('[data-reveal]').forEach(function(el) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }

    // ============================================
    // 15. KEYBOARD NAVIGATION (Focus trapping for modal)
    // ============================================
    if (modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        e.preventDefault();
                        lastFocusable.focus();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        e.preventDefault();
                        firstFocusable.focus();
                    }
                }
            }
        });
    }

    // ============================================
    // 16. INITIAL LOAD: show toast for welcome
    // ============================================
    setTimeout(function() {
        // Only show if not dismissed already
        if (!sessionStorage.getItem('visionai_welcome_shown')) {
            window.showToast('Welcome to VisionAI! 🚀', 'success');
            sessionStorage.setItem('visionai_welcome_shown', 'true');
        }
    }, 1800);

    // ============================================
    // 17. PERFORMANCE: lazy load images/videos
    // ============================================
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src') || img.src;
                    if (img.getAttribute('data-src')) {
                        img.src = src;
                    }
                    imageObserver.unobserve(img);
                }
            });
        });
        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }

    console.log('VisionAI – Home page initialized successfully.');
})();