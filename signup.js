/* ============================================
   VISIONAI - SIGNUP PAGE JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. SIGNUP FORM HANDLING
    // ============================================

    /**
     * Initialize signup form with validation
     */
    function initSignupForm() {
        const form = document.getElementById('signupForm');
        if (!form) return;

        // Get form fields
        const firstName = document.getElementById('signupFirstName');
        const lastName = document.getElementById('signupLastName');
        const email = document.getElementById('signupEmail');
        const password = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('signupConfirmPassword');
        const termsCheckbox = document.getElementById('signupTerms');

        // Validation helper functions
        function showError(field, message) {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('error');
                const errorMsg = formGroup.querySelector('.error-message');
                if (errorMsg) errorMsg.textContent = message;
            }
        }

        function clearError(field) {
            const formGroup = field.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('error');
            }
        }

        function validateField(field) {
            clearError(field);

            if (!field.value.trim()) {
                showError(field, 'This field is required.');
                return false;
            }

            // Email validation
            if (field.type === 'email') {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(field.value.trim())) {
                    showError(field, 'Please enter a valid email address.');
                    return false;
                }
            }

            // Password validation
            if (field.id === 'signupPassword') {
                if (field.value.length < 8) {
                    showError(field, 'Password must be at least 8 characters.');
                    return false;
                }
                if (!/[A-Za-z]/.test(field.value) || !/[0-9]/.test(field.value)) {
                    showError(field, 'Password must contain at least one letter and one number.');
                    return false;
                }
            }

            // Confirm password validation
            if (field.id === 'signupConfirmPassword') {
                if (field.value !== password.value) {
                    showError(field, 'Passwords do not match.');
                    return false;
                }
            }

            return true;
        }

        // Real-time validation on blur
        [firstName, lastName, email, password, confirmPassword].forEach(function(field) {
            field.addEventListener('blur', function() {
                validateField(this);
            });

            field.addEventListener('input', function() {
                if (this.closest('.form-group')?.classList.contains('error')) {
                    validateField(this);
                }
            });
        });

        // Terms checkbox validation
        termsCheckbox.addEventListener('change', function() {
            const formGroup = this.closest('.form-group');
            if (this.checked) {
                formGroup.classList.remove('error');
            } else {
                // Only show error if it was previously marked
                if (formGroup.classList.contains('error')) {
                    // Keep as is
                }
            }
        });

        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Validate all fields
            let isValid = true;

            [firstName, lastName, email, password, confirmPassword].forEach(function(field) {
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            // Validate terms
            if (!termsCheckbox.checked) {
                const formGroup = termsCheckbox.closest('.form-group');
                formGroup.classList.add('error');
                const errorMsg = formGroup.querySelector('.error-message');
                if (errorMsg) errorMsg.textContent = 'You must agree to the terms to continue.';
                isValid = false;
            }

            if (!isValid) {
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.error('Please fix all errors before signing up.');
                }
                return;
            }

            // Simulate signup
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.textContent = 'Creating account...';
                submitBtn.disabled = true;
            }

            // Simulate API call
            setTimeout(function() {
                if (submitBtn) {
                    submitBtn.textContent = '✓ Account created!';
                }

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.success('Account created successfully! Welcome to VisionAI.');
                }

                // Redirect after delay
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 1500);

                // Reset button after redirect would be pointless, but we'll handle it
                setTimeout(function() {
                    if (submitBtn) {
                        submitBtn.textContent = originalText || 'Create Account';
                        submitBtn.disabled = false;
                    }
                }, 2000);
            }, 1200);
        });
    }

    // ============================================
    // 2. SOCIAL LOGIN BUTTONS
    // ============================================

    function initSocialButtons() {
        const socialBtns = document.querySelectorAll('.social-btn');
        socialBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const provider = this.textContent.trim();
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.info('Signing up with ' + provider + '...');
                }
                // Simulate OAuth redirect
                console.log('Social signup with:', provider);
            });
        });
    }

    // ============================================
    // 3. PASSWORD STRENGTH INDICATOR (Optional enhancement)
    // ============================================

    function initPasswordStrength() {
        const passwordField = document.getElementById('signupPassword');
        if (!passwordField) return;

        // Create strength indicator
        const formGroup = passwordField.closest('.form-group');
        if (!formGroup) return;

        const indicator = document.createElement('div');
        indicator.className = 'password-strength';
        indicator.style.cssText = `
                display: flex;
                gap: 6px;
                margin-top: 6px;
            `;

        for (let i = 0; i < 4; i++) {
            const bar = document.createElement('span');
            bar.style.cssText = `
                    flex: 1;
                    height: 3px;
                    border-radius: 2px;
                    background: var(--border-light);
                    transition: background var(--transition-fast);
                `;
            indicator.appendChild(bar);
        }

        const strengthLabel = document.createElement('span');
        strengthLabel.style.cssText = `
                font-size: 0.7rem;
                color: var(--text-muted);
                margin-left: 4px;
            `;
        indicator.appendChild(strengthLabel);

        formGroup.appendChild(indicator);

        // Update strength on input
        passwordField.addEventListener('input', function() {
            const password = this.value;
            const bars = indicator.querySelectorAll('span:not(:last-child)');
            const label = indicator.querySelector('span:last-child');

            let strength = 0;
            if (password.length >= 8) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[a-z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;

            const colors = ['var(--border-light)', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
            const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

            bars.forEach(function(bar, index) {
                bar.style.background = index < strength ? colors[strength] : 'var(--border-light)';
            });

            if (password.length > 0) {
                label.textContent = labels[strength] || '';
                label.style.color = colors[strength] || 'var(--text-muted)';
            } else {
                label.textContent = '';
            }
        });
    }

    // ============================================
    // 4. EXPOSE PUBLIC API
    // ============================================

    window.SignupPage = {
        initForm: initSignupForm,
        initSocial: initSocialButtons,
        initStrength: initPasswordStrength,
        initAll: function() {
            initSignupForm();
            initSocialButtons();
            initPasswordStrength();
        }
    };

    // ============================================
    // 5. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(function() {
                    SignupPage.initAll();
                }, 100);
            });
        } else {
            setTimeout(function() {
                SignupPage.initAll();
            }, 100);
        }
    }

    init();

    console.log('Signup page module loaded.');

})();