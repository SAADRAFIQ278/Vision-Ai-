/* ============================================
   VISIONAI - HOME PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. DOM REFERENCES
    // ============================================

    const loader = document.getElementById('loader');
    const navbar = document.getElementById('navbar');
    const progressBar = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('backToTop');
    const statNumbers = document.querySelectorAll('.stat-number');
    const faqItems = document.querySelectorAll('.faq-item');
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('sliderDots');
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const demoPlayBtn = document.querySelector('.demo-play-btn');
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const modalClose = document.querySelector('.video-modal-close');
    const heroDemoBtn = document.getElementById('heroDemoBtn');
    const toast = document.getElementById('toast');
    const newsletterForm = document.getElementById('newsletterForm');
    const newsletterMessage = document.getElementById('newsletterMessage');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    // AI Studio elements
    const aiPromptInput = document.getElementById('aiPromptInput');
    const enhanceBtn = document.getElementById('enhanceBtn');
    const clearPromptBtn = document.getElementById('clearPromptBtn');
    const aiModelSelect = document.getElementById('aiModelSelect');
    const aiDurationSelect = document.getElementById('aiDurationSelect');
    const aiQualitySelect = document.getElementById('aiQualitySelect');
    const aiAspectSelect = document.getElementById('aiAspectSelect');
    const aiStyleSelect = document.getElementById('aiStyleSelect');
    const aiFpsSelect = document.getElementById('aiFpsSelect');
    const aiGenerateBtn = document.getElementById('aiGenerateBtn');
    const aiProgress = document.getElementById('aiProgress');
    const aiProgressCircle = document.getElementById('aiProgressCircle');
    const aiProgressPercent = document.getElementById('aiProgressPercent');
    const progressStatusText = document.getElementById('progressStatusText');
    const aiProgressSteps = document.getElementById('aiProgressSteps');
    const aiEstimateTime = document.getElementById('aiEstimateTime');
    const aiResult = document.getElementById('aiResult');
    const aiResultClose = document.getElementById('aiResultClose');
    const generatedVideo = document.getElementById('generatedVideo');
    const aiHistory = document.getElementById('aiHistory');
    const aiHistoryToggle = document.querySelector('.ai-history-toggle');

    // Recent prompts
    const recentTags = document.querySelectorAll('.ai-recent-tag');

    // Template preview
    const templatePreviewBtns = document.querySelectorAll('.template-preview-btn');
    const templatePreviewModal = document.getElementById('templatePreviewModal');
    const templatePreviewClose = document.querySelector('.template-preview-close');

    // ============================================
    // 2. LOADER
    // ============================================

    if (loader) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                loader.classList.add('hidden');
            }, 500);
        });
    }

    // ============================================
    // 3. STICKY NAVBAR & SCROLL PROGRESS
    // ============================================

    function updateNavbar() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

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
    // 4. MOBILE MENU
    // ============================================

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;
            this.setAttribute('aria-expanded', expanded);
            navLinks.classList.toggle('open');
            body.classList.toggle('menu-open');
        });

        navLinks.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                navLinks.classList.remove('open');
                hamburger.setAttribute('aria-expanded', 'false');
                body.classList.remove('menu-open');
            });
        });

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
    // 5. BACK TO TOP
    // ============================================

    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });

        backToTop.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================
    // 6. COUNTER ANIMATION
    // ============================================

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
                    el.textContent = isDecimal ? target.toFixed(1) : target;
                    el.classList.add('counter-pop');
                    setTimeout(function() {
                        el.classList.remove('counter-pop');
                    }, 500);
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

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
        setTimeout(animateCounters, 1500);
    }

    // ============================================
    // 7. FAQ ACCORDION
    // ============================================

    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;

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

    let currentSlide = 0;
    let slideCount = 0;
    let autoSlideInterval = null;

    function initSlider() {
        if (!track) return;

        const cards = track.querySelectorAll('.testimonial-card');
        slideCount = cards.length;

        if (slideCount === 0) return;

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

            if (dotsContainer) {
                const dots = dotsContainer.querySelectorAll('.dot');
                dots.forEach(function(dot, i) {
                    dot.classList.toggle('active', i === currentSlide);
                });
            }
        }

        function nextSlide() { goToSlide(currentSlide + 1); }
        function prevSlide() { goToSlide(currentSlide - 1); }

        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

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

        const slider = document.querySelector('.testimonial-slider');
        if (slider) {
            slider.addEventListener('mouseenter', stopAutoSlide);
            slider.addEventListener('mouseleave', startAutoSlide);
        }

        let touchStartX = 0;
        track.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        track.addEventListener('touchend', function(e) {
            const diff = touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) nextSlide();
                else prevSlide();
            }
        }, { passive: true });
    }

    initSlider();

    // ============================================
    // 9. VIDEO MODAL
    // ============================================

    function openVideoModal(src) {
        if (!modal || !modalVideo) return;
        const source = modalVideo.querySelector('source');
        if (source && src) {
            source.src = src;
            modalVideo.load();
        }
        modal.classList.add('open');
        modalVideo.play().catch(function() {});
        document.body.style.overflow = 'hidden';
    }

    function closeVideoModal() {
        if (!modal) return;
        modal.classList.remove('open');
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.currentTime = 0;
        }
        document.body.style.overflow = '';
    }

    function getDemoVideoSrc() {
        const video = document.querySelector('.demo-video');
        if (video) {
            const source = video.querySelector('source');
            if (source && source.src) return source.src;
            if (video.src) return video.src;
        }
        return 'https://assets.mixkit.co/videos/preview/mixkit-technology-ai-...';
    }

    if (demoPlayBtn) {
        demoPlayBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openVideoModal(getDemoVideoSrc());
        });
    }

    if (heroDemoBtn) {
        heroDemoBtn.addEventListener('click', function() {
            openVideoModal(getDemoVideoSrc());
        });
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeVideoModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) closeVideoModal();
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeVideoModal();
        }
    });

    // ============================================
    // 10. AI STUDIO - ENHANCE PROMPT
    // ============================================

    const enhancePrompts = [
        "A cinematic sunset over a futuristic city skyline with flying vehicles, neon lights reflecting on wet streets, dramatic clouds, 4k, photorealistic",
        "An epic fantasy landscape with towering mountains, magical floating islands, glowing waterfalls, mystical creatures, cinematic lighting, 8k",
        "A cyberpunk night scene with rain-soaked streets, holographic advertisements, glowing neon signs, flying cars, dystopian atmosphere, 4k",
        "A serene nature documentary shot of a lush rainforest with sunlight filtering through the canopy, exotic birds, waterfalls, slow motion, 4k",
        "A professional product showcase with a sleek dark studio setup, smooth rotating animation, premium lighting, 3D transitions, 4k",
        "A high-energy gaming montage with fast-paced action, dynamic camera movements, vibrant colors, explosive effects, 1080p, 60fps"
    ];

    if (enhanceBtn && aiPromptInput) {
        enhanceBtn.addEventListener('click', function() {
            const randomPrompt = enhancePrompts[Math.floor(Math.random() * enhancePrompts.length)];
            aiPromptInput.value = randomPrompt;
            aiPromptInput.style.transition = 'border-color 0.3s ease';
            aiPromptInput.style.borderColor = 'var(--primary)';
            setTimeout(function() {
                aiPromptInput.style.borderColor = '';
            }, 1500);

            if (window.VisionAI && window.VisionAI.Toast) {
                window.VisionAI.Toast.info('✨ Prompt enhanced with AI!');
            }
        });
    }

    // Clear prompt
    if (clearPromptBtn && aiPromptInput) {
        clearPromptBtn.addEventListener('click', function() {
            aiPromptInput.value = '';
            aiPromptInput.focus();
        });
    }

    // Recent prompt tags
    recentTags.forEach(function(tag) {
        tag.addEventListener('click', function() {
            if (aiPromptInput) {
                aiPromptInput.value = this.textContent;
                aiPromptInput.focus();
            }
        });
    });

    // ============================================
    // 11. AI STUDIO - GENERATE VIDEO
    // ============================================

    let isGenerating = false;
    let generationHistory = [];
    let historyVisible = false;

    // Load history from session storage
    try {
        const saved = sessionStorage.getItem('visionai_history');
        if (saved) {
            generationHistory = JSON.parse(saved);
        }
    } catch (e) {}

    if (aiGenerateBtn) {
        aiGenerateBtn.addEventListener('click', function() {
            if (isGenerating) return;

            const prompt = aiPromptInput ? aiPromptInput.value.trim() : '';
            if (!prompt) {
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.warning('Please enter a video prompt first.');
                }
                aiPromptInput.focus();
                return;
            }

            // Update credits display
            const creditsEl = document.querySelector('.ai-card-credits');
            if (creditsEl) {
                const current = parseInt(creditsEl.textContent.replace(/[^0-9]/g, '')) || 2450;
                const newCredits = current - 2;
                creditsEl.textContent = '⚡ ' + newCredits.toLocaleString() + ' credits';
            }

            startGeneration();
        });
    }

    // Update estimate time when duration changes
    if (aiDurationSelect && aiEstimateTime) {
        aiDurationSelect.addEventListener('change', function() {
            const duration = parseInt(this.value);
            const model = aiModelSelect ? aiModelSelect.value : 'studio';
            const speeds = { pro: 1.5, studio: 0.8, lite: 0.4 };
            const speed = speeds[model] || 0.8;
            const estimate = Math.round(duration * speed);
            document.getElementById('aiEstimateLabel').textContent = '⏱ ~' + estimate + 's';
        });
    }

    // Update estimate when model changes
    if (aiModelSelect && aiDurationSelect) {
        aiModelSelect.addEventListener('change', function() {
            const duration = parseInt(aiDurationSelect.value);
            const speeds = { pro: 1.5, studio: 0.8, lite: 0.4 };
            const speed = speeds[this.value] || 0.8;
            const estimate = Math.round(duration * speed);
            document.getElementById('aiEstimateLabel').textContent = '⏱ ~' + estimate + 's';
        });
    }

    function startGeneration() {
        isGenerating = true;
        aiGenerateBtn.disabled = true;
        aiGenerateBtn.innerHTML = '<span class="spinner"></span> Generating...';

        // Reset and show progress
        aiResult.style.display = 'none';
        aiProgress.classList.add('active');
        aiProgressCircle.style.strokeDashoffset = '339.292';
        aiProgressPercent.textContent = '0%';
        if (aiEstimateTime) {
            const duration = parseInt(aiDurationSelect ? aiDurationSelect.value : 30);
            const model = aiModelSelect ? aiModelSelect.value : 'studio';
            const speeds = { pro: 1.5, studio: 0.8, lite: 0.4 };
            const speed = speeds[model] || 0.8;
            aiEstimateTime.textContent = '~' + Math.round(duration * speed) + 's remaining';
        }

        const steps = aiProgressSteps.querySelectorAll('.step');
        steps.forEach(function(step) {
            step.classList.remove('active', 'completed');
        });

        const statusMessages = [
            'Analyzing your prompt...',
            'Generating frames...',
            'Rendering video...',
            'Finalizing...'
        ];

        let progress = 0;
        let currentStep = 0;
        const totalSteps = 4;
        const stepIncrement = 100 / totalSteps;
        const circumference = 339.292;

        function updateStatus(stepIndex) {
            if (progressStatusText && statusMessages[stepIndex]) {
                progressStatusText.textContent = statusMessages[stepIndex];
            }
            steps.forEach(function(step, index) {
                step.classList.remove('active', 'completed');
                if (index < stepIndex) {
                    step.classList.add('completed');
                } else if (index === stepIndex) {
                    step.classList.add('active');
                }
            });

            // Update estimate time
            if (aiEstimateTime) {
                const remaining = Math.max(0, Math.round((100 - progress) / 8));
                aiEstimateTime.textContent = '~' + remaining + 's remaining';
            }
        }

        function simulateGeneration() {
            progress += 0.5 + Math.random() * 1.5;
            const percent = Math.min(progress, 100);
            aiProgressPercent.textContent = Math.round(percent) + '%';

            // Update circle progress
            const offset = circumference - (percent / 100) * circumference;
            aiProgressCircle.style.strokeDashoffset = offset;

            const stepIndex = Math.min(Math.floor(percent / stepIncrement), totalSteps - 1);
            if (stepIndex !== currentStep) {
                currentStep = stepIndex;
                updateStatus(currentStep);
            }

            if (progress < 100) {
                const delay = 20 + Math.random() * 30;
                setTimeout(simulateGeneration, delay);
            } else {
                setTimeout(function() {
                    completeGeneration();
                }, 400);
            }
        }

        function completeGeneration() {
            // Complete circle
            aiProgressCircle.style.strokeDashoffset = '0';

            steps.forEach(function(step) {
                step.classList.remove('active');
                step.classList.add('completed');
            });

            if (progressStatusText) progressStatusText.textContent = '✅ Video generated!';
            if (aiEstimateTime) aiEstimateTime.textContent = '✨ Complete!';
            aiProgressPercent.textContent = '100%';

            // Show result
            aiResult.style.display = 'block';

            // Simulate video result
            const videoEl = aiResult.querySelector('video');
            if (videoEl) {
                const demoVideo = document.querySelector('.demo-video');
                if (demoVideo) {
                    const source = demoVideo.querySelector('source');
                    if (source) {
                        const videoSource = videoEl.querySelector('source');
                        if (videoSource) {
                            videoSource.src = source.src;
                            videoEl.load();
                        }
                    }
                }
            }

            // Add to history
            addToHistory(aiPromptInput ? aiPromptInput.value.trim() : 'Untitled');

            // Reset button
            aiGenerateBtn.disabled = false;
            aiGenerateBtn.innerHTML = '⚡ Generate Video';
            isGenerating = false;

            if (window.VisionAI && window.VisionAI.Toast) {
                window.VisionAI.Toast.success('🎬 Video generated successfully!');
            }

            // Show history
            if (aiHistory) {
                aiHistory.style.display = 'block';
            }

            // Play success sound effect? No, keep it silent.

            setTimeout(function() {
                aiProgress.classList.remove('active');
            }, 3000);
        }

        updateStatus(0);
        setTimeout(simulateGeneration, 500);
    }

    // ============================================
    // 12. AI HISTORY
    // ============================================

    function addToHistory(prompt) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        generationHistory.unshift({
            prompt: prompt.substring(0, 40) + (prompt.length > 40 ? '...' : ''),
            status: 'completed',
            time: timeStr
        });

        if (generationHistory.length > 10) {
            generationHistory.pop();
        }

        try {
            sessionStorage.setItem('visionai_history', JSON.stringify(generationHistory));
        } catch (e) {}

        renderHistory();
    }

    function renderHistory() {
        const historyList = aiHistory ? aiHistory.querySelector('.ai-history-list') : null;
        if (!historyList) return;

        historyList.innerHTML = '';
        if (generationHistory.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'history-empty';
            empty.textContent = 'No generations yet. Create your first video!';
            empty.style.cssText = 'color: var(--text-muted); font-size: 0.8rem; padding: 12px 0; text-align: center;';
            historyList.appendChild(empty);
            return;
        }

        generationHistory.forEach(function(item) {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <span class="history-prompt">${item.prompt}</span>
                <span class="history-status completed">✓</span>
                <span class="history-time">${item.time}</span>
            `;
            historyList.appendChild(div);
        });
    }

    if (aiHistoryToggle && aiHistory) {
        aiHistoryToggle.addEventListener('click', function() {
            historyVisible = !historyVisible;
            const list = aiHistory.querySelector('.ai-history-list');
            if (list) {
                list.style.display = historyVisible ? 'block' : 'none';
            }
            this.textContent = historyVisible ? '▲' : '▼';
        });

        // Show history if there are items
        if (generationHistory.length > 0) {
            const list = aiHistory.querySelector('.ai-history-list');
            if (list) {
                list.style.display = 'block';
                historyVisible = true;
            }
            aiHistoryToggle.textContent = '▲';
            renderHistory();
        } else {
            renderHistory();
        }
    }

    // Close result
    if (aiResultClose) {
        aiResultClose.addEventListener('click', function() {
            aiResult.style.display = 'none';
            if (generatedVideo) {
                generatedVideo.pause();
                generatedVideo.currentTime = 0;
            }
        });
    }

    // ============================================
    // 13. TEMPLATE PREVIEW
    // ============================================

    if (templatePreviewBtns.length > 0 && templatePreviewModal) {
        templatePreviewBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const card = this.closest('.template-card');
                if (card) {
                    const name = card.querySelector('.template-name')?.textContent || 'Template';
                    const desc = card.querySelector('.template-desc')?.textContent || '';
                    const video = card.querySelector('.template-video');

                    const titleEl = templatePreviewModal.querySelector('.template-preview-title');
                    const descEl = templatePreviewModal.querySelector('.template-preview-desc');
                    const videoEl = templatePreviewModal.querySelector('.template-preview-video video');

                    if (titleEl) titleEl.textContent = name;
                    if (descEl) descEl.textContent = desc;

                    if (videoEl && video) {
                        const source = video.querySelector('source');
                        if (source) {
                            const videoSource = videoEl.querySelector('source');
                            if (videoSource) {
                                videoSource.src = source.src;
                                videoEl.load();
                            }
                        }
                    }

                    templatePreviewModal.classList.add('open');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    }

    if (templatePreviewClose && templatePreviewModal) {
        templatePreviewClose.addEventListener('click', function() {
            templatePreviewModal.classList.remove('open');
            document.body.style.overflow = '';
            const video = templatePreviewModal.querySelector('.template-preview-video video');
            if (video) {
                video.pause();
                video.currentTime = 0;
            }
        });
    }

    if (templatePreviewModal) {
        templatePreviewModal.addEventListener('click', function(e) {
            if (e.target === this) {
                templatePreviewModal.classList.remove('open');
                document.body.style.overflow = '';
                const video = this.querySelector('.template-preview-video video');
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
    }

    // ============================================
    // 14. TOAST NOTIFICATION
    // ============================================

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
            } else if (type === 'warning') {
                iconEl.textContent = '⚠';
                iconEl.style.color = '#F59E0B';
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
    // 15. NEWSLETTER FORM
    // ============================================

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

            if (newsletterMessage) {
                newsletterMessage.textContent = '✅ Subscribed successfully! Check your inbox.';
                newsletterMessage.style.color = '#10B981';
            }
            if (input) input.value = '';
            window.showToast('Subscribed successfully!', 'success');
        });
    }

    // ============================================
    // 16. HERO PARTICLES
    // ============================================

    function createHeroParticles() {
        const container = document.getElementById('heroParticles');
        if (!container) return;

        const particleCount = 40;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            const size = 2 + Math.random() * 4;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDuration = (12 + Math.random() * 10) + 's';
            particle.style.animationDelay = (Math.random() * 12) + 's';
            particle.style.opacity = 0.15 + Math.random() * 0.35;
            container.appendChild(particle);
        }
    }
    createHeroParticles();

    // ============================================
    // 17. SMOOTH SCROLL (Anchor Links)
    // ============================================

    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        const href = anchor.getAttribute('href');
        if (href === '#' || href === '#!') return;

        anchor.addEventListener('click', function(e) {
            const targetId = href;
            const target = document.querySelector(targetId);
            if (!target) return;

            e.preventDefault();
            const navbarHeight = navbar ? navbar.offsetHeight : 80;
            const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 10;

            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });

            if (history.pushState) {
                history.pushState(null, null, href);
            }
        });
    });

    // ============================================
    // 18. LOAD MORE FUNCTIONALITY (Placeholder)
    // ============================================

    const loadMoreBtn = document.getElementById('galleryLoadMore') || document.querySelector('.templates-load-more .btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            window.showToast('Loading more content...', 'info');
        });
    }

    // ============================================
    // 19. CURSOR GLOW ENHANCEMENT
    // ============================================

    document.querySelectorAll('.btn, .feature-card, .model-card, .template-card, .pricing-card, .glass-card').forEach(function(el) {
        el.addEventListener('mouseenter', function() {
            const glow = document.getElementById('cursorGlow');
            if (glow) {
                glow.style.background = 'radial-gradient(circle, rgba(124, 58, 237, 0.12), transparent 70%)';
                glow.style.width = '400px';
                glow.style.height = '400px';
            }
        });
        el.addEventListener('mouseleave', function() {
            const glow = document.getElementById('cursorGlow');
            if (glow) {
                glow.style.background = 'radial-gradient(circle, rgba(124, 58, 237, 0.06), transparent 70%)';
                glow.style.width = '300px';
                glow.style.height = '300px';
            }
        });
    });

    // ============================================
    // 20. AI DEMO STATUS CYCLE
    // ============================================

    const demoStatus = document.querySelector('.demo-status');
    if (demoStatus) {
        const statusTexts = [
            '◆ AI Analyzing prompt...',
            '◆ AI Generating frames...',
            '◆ AI Rendering video...',
            '◆ AI Finalizing...',
            '◆ AI Video ready!'
        ];
        let statusIndex = 0;

        function cycleDemoStatus() {
            statusIndex = (statusIndex + 1) % statusTexts.length;
            demoStatus.textContent = statusTexts[statusIndex];
        }
        setInterval(cycleDemoStatus, 3000);
    }

    // ============================================
    // 21. DEMO TIMELINE
    // ============================================

    const demoTimelineFill = document.querySelector('.demo-timeline-fill');
    if (demoTimelineFill) {
        function resetDemoTimeline() {
            demoTimelineFill.style.animation = 'none';
            void demoTimelineFill.offsetHeight;
            demoTimelineFill.style.animation = 'demo-progress 4s ease-in-out infinite';
        }
        setInterval(resetDemoTimeline, 4000);
    }

    // ============================================
    // 22. PERFORMANCE: Lazy load images/videos
    // ============================================

    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                    }
                    img.classList.remove('skeleton');
                    imageObserver.unobserve(img);
                }
            });
        });
        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });

        const lazyVideos = document.querySelectorAll('video[loading="lazy"]');
        const videoObserver = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    if (video.dataset.src) {
                        const source = video.querySelector('source');
                        if (source) {
                            source.src = video.dataset.src;
                            video.load();
                        }
                    }
                    videoObserver.unobserve(video);
                }
            });
        });
        lazyVideos.forEach(function(video) {
            videoObserver.observe(video);
        });
    }

    // ============================================
    // 23. SKELETON LOADER FOR IMAGES
    // ============================================

    document.querySelectorAll('img[loading="lazy"]').forEach(function(img) {
        img.classList.add('skeleton');
        img.addEventListener('load', function() {
            this.classList.remove('skeleton');
        });
        img.addEventListener('error', function() {
            this.classList.remove('skeleton');
        });
    });

    // ============================================
    // 24. INITIAL TOAST
    // ============================================

    setTimeout(function() {
        if (!sessionStorage.getItem('visionai_welcome_shown')) {
            window.showToast('Welcome to VisionAI! 🚀 Start creating AI videos.', 'success');
            sessionStorage.setItem('visionai_welcome_shown', 'true');
        }
    }, 2000);

    // ============================================
    // 25. KEYBOARD SHORTCUTS
    // ============================================

    document.addEventListener('keydown', function(e) {
        // Press 'G' to focus AI Studio
        if ((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const aiCard = document.querySelector('.hero-ai-card');
            if (aiCard) {
                e.preventDefault();
                aiCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const input = aiCard.querySelector('#aiPromptInput');
                if (input) {
                    setTimeout(function() { input.focus(); }, 500);
                }
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('🎯 AI Studio focused');
                }
            }
        }

        // Press 'H' to go home
        if ((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.metaKey && !e.altKey) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    // ============================================
    // 26. FLOATING CARD INTERACTIVITY
    // ============================================

    document.querySelectorAll('.floating-card').forEach(function(card) {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.08)';
            this.style.borderColor = 'var(--border-primary)';
            this.style.boxShadow = 'var(--shadow-md)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
    });

    // ============================================
    // 27. CHART BAR ANIMATION (On scroll)
    // ============================================

    if ('IntersectionObserver' in window) {
        const chartBars = document.querySelectorAll('.chart-bar');
        if (chartBars.length > 0) {
            const chartObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const bars = entry.target.querySelectorAll('.chart-bar');
                        bars.forEach(function(bar, index) {
                            const height = bar.style.height;
                            bar.style.height = '0%';
                            setTimeout(function() {
                                bar.style.transition = 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                                bar.style.height = height;
                            }, index * 80);
                        });
                        chartObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            const chartContainer = document.querySelector('.mockup-chart');
            if (chartContainer) {
                chartObserver.observe(chartContainer);
            }
        }
    }

    console.log('VisionAI Home page initialized successfully.');

})();