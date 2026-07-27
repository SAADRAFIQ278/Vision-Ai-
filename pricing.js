/* ============================================
   VISIONAI - PRICING PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. PRICING TOGGLE (Monthly / Annual)
    // ============================================

    /**
     * Initialize pricing toggle functionality
     */
    function initPricingToggle() {
        const toggleTrack = document.getElementById('billingToggle');
        const monthlyLabel = document.getElementById('monthlyLabel');
        const annualLabel = document.getElementById('annualLabel');
        const priceAmounts = document.querySelectorAll('.pricing-price .amount');
        const toggleSave = document.querySelector('.toggle-save');

        if (!toggleTrack) return;

        let isAnnual = false;

        function updatePrices(annual) {
            isAnnual = annual;

            // Update toggle UI
            toggleTrack.classList.toggle('active', annual);
            toggleTrack.setAttribute('aria-checked', annual ? 'true' : 'false');

            // Update labels
            if (monthlyLabel) monthlyLabel.classList.toggle('active', !annual);
            if (annualLabel) annualLabel.classList.toggle('active', annual);

            // Update price amounts
            priceAmounts.forEach(function(amount) {
                const monthlyPrice = parseFloat(amount.dataset.monthly);
                const annualPrice = parseFloat(amount.dataset.annual);
                if (!isNaN(monthlyPrice) && !isNaN(annualPrice)) {
                    amount.textContent = annual ? annualPrice : monthlyPrice;
                }
            });

            // Update save badge
            if (toggleSave) {
                toggleSave.style.display = annual ? 'inline-block' : 'none';
            }

            // Dispatch event
            document.dispatchEvent(new CustomEvent('billing-toggle', {
                detail: { isAnnual: annual }
            }));
        }

        // Toggle on click
        toggleTrack.addEventListener('click', function() {
            updatePrices(!isAnnual);
        });

        // Keyboard support
        toggleTrack.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                updatePrices(!isAnnual);
            }
        });

        // Also allow clicking on labels
        if (monthlyLabel) {
            monthlyLabel.addEventListener('click', function() {
                if (isAnnual) updatePrices(false);
            });
        }
        if (annualLabel) {
            annualLabel.addEventListener('click', function() {
                if (!isAnnual) updatePrices(true);
            });
        }

        // Set initial state (monthly by default)
        updatePrices(false);

        console.log('Pricing toggle initialized.');
    }

    // ============================================
    // 2. PRICING CARD INTERACTIVITY
    // ============================================

    /**
     * Add interactive effects to pricing cards
     */
    function initPricingCards() {
        const cards = document.querySelectorAll('.pricing-card');
        if (cards.length === 0) return;

        cards.forEach(function(card) {
            // Hover effect: add subtle lift
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
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

            // Click on card to navigate to signup (optional)
            // Only if not clicking on a button
            card.addEventListener('click', function(e) {
                if (e.target.closest('.btn') || e.target.closest('.pricing-badge')) return;
                const btn = this.querySelector('.btn');
                if (btn) {
                    btn.click();
                }
            });
        });

        console.log('Pricing cards interactive enhancements applied.');
    }

    // ============================================
    // 3. PRICING COMPARISON TABLE INTERACTIVITY
    // ============================================

    function initComparisonTable() {
        const table = document.querySelector('.pricing-comparison-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(function(row) {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(124, 58, 237, 0.06)';
            });
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = '';
            });
        });

        // Add sticky header shadow on scroll
        const wrapper = table.closest('.comparison-scroll');
        if (wrapper) {
            wrapper.addEventListener('scroll', function() {
                const thead = table.querySelector('thead');
                if (this.scrollTop > 0) {
                    thead.style.boxShadow = '0 2px 12px rgba(0,0,0,0.3)';
                } else {
                    thead.style.boxShadow = 'none';
                }
            });
        }

        console.log('Pricing comparison table initialized.');
    }

    // ============================================
    // 4. PRICING FAQ ACCORDION (if separate)
    // ============================================

    /**
     * Initialize FAQ accordion on pricing page
     * (reuses the same logic as global FAQ but scoped)
     */
    function initPricingFaq() {
        const faqItems = document.querySelectorAll('.pricing-faq .faq-item');
        if (faqItems.length === 0) return;

        faqItems.forEach(function(item) {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', function() {
                    const expanded = this.getAttribute('aria-expanded') === 'true' ? false : true;

                    // Close other items
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

        console.log('Pricing FAQ accordion initialized.');
    }

    // ============================================
    // 5. EXPOSE PUBLIC API
    // ============================================

    window.PricingPage = {
        initToggle: initPricingToggle,
        initCards: initPricingCards,
        initTable: initComparisonTable,
        initFaq: initPricingFaq,
        initAll: function() {
            initPricingToggle();
            initPricingCards();
            initComparisonTable();
            initPricingFaq();
        }
    };

    // ============================================
    // 6. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    PricingPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                PricingPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('Pricing page module loaded.');

})();