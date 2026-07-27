/* ============================================
   VISIONAI - AI DEMO JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. DOM REFERENCES
    // ============================================

    const demoVideoCard = document.querySelector('.demo-video-card');
    const demoVideo = document.querySelector('.demo-video');
    const demoPlayBtn = document.querySelector('.demo-play-btn');
    const demoOverlay = document.querySelector('.demo-overlay');
    const demoStatus = document.querySelector('.demo-status');
    const demoPrompt = document.querySelector('.demo-prompt');

    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalClose = document.querySelector('.video-modal-close');

    // ============================================
    // 2. FAKE AI RENDERING STATUS
    // ============================================

    const statusMessages = [
        { text: '◆ AI Analyzing prompt...', emoji: '🔍' },
        { text: '◆ AI Generating frames...', emoji: '🎨' },
        { text: '◆ AI Rendering video...', emoji: '⚡' },
        { text: '◆ AI Finalizing...', emoji: '✨' },
        { text: '◆ AI Video ready!', emoji: '🎬' }
    ];

    let statusIndex = 0;
    let statusInterval = null;
    let isDemoPlaying = false;

    /**
     * Cycle through AI status messages
     */
    function cycleStatus() {
        if (!demoStatus) return;

        // Remove previous status classes
        demoStatus.classList.remove('status-analyzing', 'status-generating', 'status-rendering', 'status-finalizing', 'status-ready');

        const message = statusMessages[statusIndex];
        demoStatus.textContent = message.text;

        // Add class for styling
        const statusClass = [
            'status-analyzing',
            'status-generating',
            'status-rendering',
            'status-finalizing',
            'status-ready'
        ][statusIndex] || '';

        if (statusClass) {
            demoStatus.classList.add(statusClass);
        }

        statusIndex = (statusIndex + 1) % statusMessages.length;
    }

    /**
     * Start the AI status cycling
     */
    function startStatusCycle() {
        if (statusInterval) {
            clearInterval(statusInterval);
        }
        statusIndex = 0;
        cycleStatus();
        statusInterval = setInterval(cycleStatus, 2500);
    }

    /**
     * Stop the AI status cycling
     */
    function stopStatusCycle() {
        if (statusInterval) {
            clearInterval(statusInterval);
            statusInterval = null;
        }
    }

    /**
     * Reset status to initial state
     */
    function resetStatus() {
        stopStatusCycle();
        statusIndex = 0;
        if (demoStatus) {
            demoStatus.textContent = '◆ AI Generating...';
            demoStatus.className = 'demo-status';
        }
    }

    // ============================================
    // 3. VIDEO MODAL
    // ============================================

    /**
     * Open the video modal with a given video source
     */
    function openVideoModal(src) {
        if (!modal || !modalVideo) return;

        // Set video source
        const sourceEl = modalVideo.querySelector('source');
        if (sourceEl && src) {
            sourceEl.src = src;
            modalVideo.load();
        }

        // Show modal
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');

        // Lock scroll
        document.body.style.overflow = 'hidden';

        // Try to play
        modalVideo.play().catch(function(err) {
            console.log('Autoplay prevented:', err);
        });

        // Dispatch event
        document.dispatchEvent(new CustomEvent('video-modal-open', {
            detail: { src: src }
        }));
    }

    /**
     * Close the video modal
     */
    function closeVideoModal() {
        if (!modal) return;

        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');

        // Pause and reset video
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }

        // Unlock scroll
        document.body.style.overflow = '';

        // Dispatch event
        document.dispatchEvent(new CustomEvent('video-modal-close'));
    }

    /**
     * Get the video source from the demo video element
     */
    function getDemoVideoSrc() {
        if (!demoVideo) return '';

        const source = demoVideo.querySelector('source');
        if (source && source.src) {
            return source.src;
        }

        // Try to get from video src attribute
        if (demoVideo.src) {
            return demoVideo.src;
        }

        // Fallback to a placeholder video
        return 'https://assets.mixkit.co/videos/preview/mixkit-technology-ai-...';
    }

    // ============================================
    // 4. DEMO PLAY BUTTON
    // ============================================

    /**
     * Handle demo play button click
     */
    function handleDemoPlay(e) {
        e.stopPropagation();

        // Get video source
        const src = getDemoVideoSrc();

        if (src) {
            openVideoModal(src);
        } else {
            // If no video source, show a toast
            if (window.VisionAI && window.VisionAI.Toast) {
                window.VisionAI.Toast.info('Demo video is being prepared. Please check back soon!');
            } else {
                alert('Demo video is being prepared. Please check back soon!');
            }
        }
    }

    // ============================================
    // 5. CLICK ON DEMO CARD (Overlay)
    // ============================================

    /**
     * Handle click on the demo card overlay
     */
    function handleDemoCardClick(e) {
        // If the click is on the play button, it's already handled
        if (e.target.closest('.demo-play-btn')) return;

        // If click is on the overlay or card, trigger play
        const src = getDemoVideoSrc();
        if (src) {
            openVideoModal(src);
        }
    }

    // ============================================
    // 6. KEYBOARD SHORTCUTS FOR MODAL
    // ============================================

    /**
     * Handle keyboard events for the modal
     */
    function handleModalKeyboard(e) {
        if (!modal || !modal.classList.contains('open')) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            closeVideoModal();
        }

        if (e.key === ' ' || e.key === 'Space') {
            e.preventDefault();
            if (modalVideo) {
                if (modalVideo.paused) {
                    modalVideo.play().catch(function() {});
                } else {
                    modalVideo.pause();
                }
            }
        }
    }

    // ============================================
    // 7. MODAL CLOSE ON OVERLAY CLICK
    // ============================================

    function handleModalOverlayClick(e) {
        if (e.target === modal) {
            closeVideoModal();
        }
    }

    // ============================================
    // 8. MODAL VIDEO EVENTS
    // ============================================

    function setupModalVideoEvents() {
        if (!modalVideo) return;

        // When video ends, close modal (optional)
        // modalVideo.addEventListener('ended', closeVideoModal);

        // Handle errors
        modalVideo.addEventListener('error', function() {
            console.warn('Video playback error');
            if (window.VisionAI && window.VisionAI.Toast) {
                window.VisionAI.Toast.error('Video could not be loaded. Please try again.');
            }
        });
    }

    // ============================================
    // 9. INITIALIZE THE DEMO
    // ============================================

    function initDemo() {
        // Start AI status cycling
        startStatusCycle();

        // Set up play button
        if (demoPlayBtn) {
            demoPlayBtn.addEventListener('click', handleDemoPlay);
        }

        // Set up demo card click (overlay)
        if (demoVideoCard) {
            demoVideoCard.addEventListener('click', handleDemoCardClick);
        }

        // Set up video modal
        if (modalClose) {
            modalClose.addEventListener('click', closeVideoModal);
        }

        if (modal) {
            modal.addEventListener('click', handleModalOverlayClick);
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', handleModalKeyboard);

        // Modal video events
        setupModalVideoEvents();

        // Demo prompt animation - add typing effect
        if (demoPrompt) {
            // If there's a typing effect already, we can enhance it
            const prompts = [
                '"A futuristic city with flying cars, cyberpunk style, 4k"',
                '"Cinematic landscape with dramatic lighting, epic scale"',
                '"Animated explainer video for a tech startup, modern style"',
                '"Product showcase with smooth transitions, premium feel"',
                '"Documentary-style nature footage, slow motion, 8k"'
            ];

            let promptIndex = 0;

            function rotatePrompt() {
                if (!demoPrompt) return;
                promptIndex = (promptIndex + 1) % prompts.length;
                // Animate the text change
                demoPrompt.style.transition = 'opacity 0.3s ease';
                demoPrompt.style.opacity = '0';
                setTimeout(function() {
                    demoPrompt.textContent = prompts[promptIndex];
                    demoPrompt.style.opacity = '1';
                }, 300);
            }

            // Rotate prompt every 8 seconds (only if not in modal)
            if (!document.querySelector('.video-modal.open')) {
                setInterval(rotatePrompt, 8000);
            }
        }

        console.log('AI Demo initialized successfully.');
    }

    // ============================================
    // 10. PUBLIC API
    // ============================================

    window.AIDemo = {
        play: function() {
            const src = getDemoVideoSrc();
            if (src) {
                openVideoModal(src);
            }
        },
        close: closeVideoModal,
        toggleStatus: function() {
            if (statusInterval) {
                stopStatusCycle();
            } else {
                startStatusCycle();
            }
        },
        getStatus: function() {
            return statusIndex;
        },
        isPlaying: function() {
            return modal && modal.classList.contains('open');
        },
        setPrompt: function(text) {
            if (demoPrompt) {
                demoPrompt.textContent = text;
            }
        }
    };

    // ============================================
    // 11. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initDemo, 200);
            });
        } else {
            setTimeout(initDemo, 200);
        }
    }

    init();

    console.log('AI Demo module loaded.');

})();