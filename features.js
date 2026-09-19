/* ============================================
   VISIONAI - FEATURES PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. DOM REFERENCES
    // ============================================

    const featureCards = document.querySelectorAll('.feature-detail-card');
    const heroStats = document.querySelectorAll('.hero-stat-number');
    const featureLinks = document.querySelectorAll('.feature-detail-card .feature-link');
    const demoPlayBtn = document.querySelector('.feature-demo-video .demo-play-btn');
    const demoVideoCard = document.querySelector('.feature-demo-video .demo-video-card');
    const demoProgressFill = document.querySelector('.feature-demo-video .demo-progress-fill');
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalClose = document.querySelector('.video-modal-close');

    // ============================================
    // 2. FEATURE CARD INTERACTIVITY
    // ============================================

    /**
     * Add interactive effects to feature cards
     */
    function initFeatureCards() {
        if (featureCards.length === 0) return;

        featureCards.forEach(function(card) {
            // 3D tilt effect on hover (desktop only)
            card.addEventListener('mousemove', function(e) {
                if (window.innerWidth < 768) return;
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 20;
                const rotateY = (centerX - x) / 20;
                this.style.transform =
                    'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
            });

            card.addEventListener('mouseleave', function() {
                this.style.transform = '';
            });

            // Accessibility: focus states
            card.setAttribute('tabindex', '0');
            card.addEventListener('focusin', function() {
                this.style.outline = '2px solid var(--primary)';
                this.style.outlineOffset = '2px';
            });
            card.addEventListener('focusout', function() {
                this.style.outline = 'none';
            });

            // Click on card to show a toast with feature info
            card.addEventListener('click', function(e) {
                // Don't trigger if clicking on a link
                if (e.target.closest('.feature-link')) return;
                const title = this.querySelector('.feature-title')?.textContent || 'Feature';
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('🔍 ' + title + ' — Click "Learn More" for details.');
                }
            });
        });

        console.log('Feature cards interactive enhancements applied.');
    }

    // ============================================
    // 3. FEATURE LINK INTERCEPT
    // ============================================

    function initFeatureLinks() {
        if (featureLinks.length === 0) return;

        featureLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.feature-detail-card');
                const title = card?.querySelector('.feature-title')?.textContent || 'Feature';

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('📖 Loading details for: ' + title);
                }

                // Simulate navigation
                console.log('Navigating to feature:', title);

                // In production, this would navigate to a feature detail page
                // window.location.href = this.getAttribute('href');
            });
        });
    }

    // ============================================
    // 4. FEATURE STATS COUNTER
    // ============================================

    function initFeatureStats() {
        if (heroStats.length === 0) return;

        let animated = false;

        function animateStats() {
            if (animated) return;
            animated = true;

            heroStats.forEach(function(stat) {
                const target = parseFloat(stat.getAttribute('data-count')) || 0;
                const isDecimal = target % 1 !== 0;
                const duration = 1500;
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const current = eased * target;

                    if (isDecimal) {
                        stat.textContent = current.toFixed(1);
                    } else {
                        stat.textContent = Math.floor(current);
                    }

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    } else {
                        stat.textContent = isDecimal ? target.toFixed(1) : target;
                        stat.classList.add('counter-pop');
                        setTimeout(function() {
                            stat.classList.remove('counter-pop');
                        }, 500);
                    }
                }
                requestAnimationFrame(update);
            });
        }

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !animated) {
                    animateStats();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        const container = document.querySelector('.features-hero-stats');
        if (container) {
            observer.observe(container);
        } else if (heroStats.length > 0) {
            observer.observe(heroStats[0]);
        }

        // Fallback: start after 2 seconds if not triggered
        setTimeout(function() {
            if (!animated) {
                animateStats();
            }
        }, 3000);
    }

    // ============================================
    // 5. DEMO VIDEO PLAY
    // ============================================

    function initDemoVideo() {
        if (!demoPlayBtn || !demoVideoCard) return;

        function getDemoVideoSrc() {
            const video = demoVideoCard.querySelector('.demo-video');
            if (video) {
                const source = video.querySelector('source');
                if (source && source.src) return source.src;
                if (video.src) return video.src;
            }
            return 'https://assets.mixkit.co/videos/preview/mixkit-technology-ai-...';
        }

        demoPlayBtn.addEventListener('click', function(e) {
            e.stopPropagation();

            // Open video modal
            const src = getDemoVideoSrc();
            if (modal && modalVideo) {
                const source = modalVideo.querySelector('source');
                if (source && src) {
                    source.src = src;
                    modalVideo.load();
                }
                modal.classList.add('open');
                modalVideo.play().catch(function() {});
                document.body.style.overflow = 'hidden';

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('▶️ Playing demo video');
                }
            }
        });

        // Click on the card to play
        demoVideoCard.addEventListener('click', function(e) {
            if (e.target.closest('.demo-play-btn')) return;
            demoPlayBtn.click();
        });

        // Reset demo progress fill periodically
        if (demoProgressFill) {
            function resetProgress() {
                demoProgressFill.style.animation = 'none';
                void demoProgressFill.offsetHeight;
                demoProgressFill.style.animation = 'demo-progress 4s ease-in-out infinite';
            }
            setInterval(resetProgress, 4000);
        }
    }

    // ============================================
    // 6. VIDEO MODAL (Global - reusing from index)
    // ============================================

    function initVideoModal() {
        if (!modal || !modalClose) return;

        modalClose.addEventListener('click', function() {
            modal.classList.remove('open');
            if (modalVideo) {
                modalVideo.pause();
                modalVideo.currentTime = 0;
            }
            document.body.style.overflow = '';
        });

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('open');
                if (modalVideo) {
                    modalVideo.pause();
                    modalVideo.currentTime = 0;
                }
                document.body.style.overflow = '';
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
                modal.classList.remove('open');
                if (modalVideo) {
                    modalVideo.pause();
                    modalVideo.currentTime = 0;
                }
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================
    // 7. KEYBOARD SHORTCUTS
    // ============================================

    function initKeyboardShortcuts() {
        document.addEventListener('keydown', function(e) {
            // Press 'F' to focus first feature card
            if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const firstCard = document.querySelector('.feature-detail-card');
                if (firstCard) {
                    e.preventDefault();
                    firstCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstCard.focus();
                    if (window.VisionAI && window.VisionAI.Toast) {
                        window.VisionAI.Toast.info('🎯 Focused on Features');
                    }
                }
            }
        });
    }

    // ============================================
    // 8. EXPOSE PUBLIC API
    // ============================================

    window.FeaturesPage = {
        initCards: initFeatureCards,
        initLinks: initFeatureLinks,
        initStats: initFeatureStats,
        initDemo: initDemoVideo,
        initModal: initVideoModal,
        initShortcuts: initKeyboardShortcuts,
        initAll: function() {
            initFeatureCards();
            initFeatureLinks();
            initFeatureStats();
            initDemoVideo();
            initVideoModal();
            initKeyboardShortcuts();
        }
    };

    // ============================================
    // 9. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    FeaturesPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                FeaturesPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('Features page module loaded.');

})();