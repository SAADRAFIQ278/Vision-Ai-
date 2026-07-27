/* ============================================
   VISIONAI - FORMS JAVASCRIPT
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // 1. FORM VALIDATION CONFIGURATION
    // ============================================

    const VALIDATION_RULES = {
        required: function(value) {
            if (typeof value === 'string') {
                return value.trim().length > 0;
            }
            return value !== null && value !== undefined && value !== '';
        },
        email: function(value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailPattern.test(value.trim());
        },
        password: function(value) {
            // At least 8 characters, with at least one letter and one number
            return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
        },
        minLength: function(value, min) {
            return value.length >= min;
        },
        maxLength: function(value, max) {
            return value.length <= max;
        },
        match: function(value, compareField) {
            return value === compareField;
        },
        phone: function(value) {
            const phonePattern = /^[\+\d\s\-\(\)]{7,20}$/;
            return phonePattern.test(value.trim());
        },
        url: function(value) {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },
        numeric: function(value) {
            return /^[\d]+$/.test(value);
        }
    };

    // ============================================
    // 2. FORM VALIDATOR CLASS
    // ============================================

    class FormValidator {
        constructor(form, options) {
            this.form = form;
            this.options = Object.assign({
                validateOnBlur: true,
                validateOnInput: false,
                showErrors: true,
                errorClass: 'error',
                errorMessageClass: 'error-message',
                successClass: 'success',
                autoSubmit: true
            }, options);

            this.fields = [];
            this.errors = {};
            this.isValid = false;
            this._initialized = false;

            // Bind methods
            this.validate = this.validate.bind(this);
            this.validateField = this.validateField.bind(this);
            this.showError = this.showError.bind(this);
            this.clearError = this.clearError.bind(this);
            this.getValues = this.getValues.bind(this);
            this.reset = this.reset.bind(this);

            this.init();
        }

        /**
         * Initialize the form validator
         */
        init() {
            if (this._initialized) return;
            this._initialized = true;

            // Find all form fields with validation
            const inputs = this.form.querySelectorAll('input, select, textarea');
            inputs.forEach(function(input) {
                // Skip buttons, hidden inputs, and fields without validation
                if (input.type === 'submit' || input.type === 'button' || input.type === 'hidden') {
                    return;
                }

                // Check if field has validation attributes
                const rules = this.getFieldRules(input);
                if (Object.keys(rules).length > 0) {
                    const field = {
                        element: input,
                        rules: rules,
                        name: input.name || input.id || '',
                        type: input.type || input.tagName.toLowerCase()
                    };
                    this.fields.push(field);

                    // Add event listeners for validation
                    if (this.options.validateOnBlur) {
                        input.addEventListener('blur', function() {
                            this.validateField(field);
                        }.bind(this));
                    }

                    if (this.options.validateOnInput) {
                        const eventType = input.type === 'select-one' ? 'change' : 'input';
                        input.addEventListener(eventType, function() {
                            // Debounce validation on input
                            clearTimeout(this._inputTimeout);
                            this._inputTimeout = setTimeout(function() {
                                this.validateField(field);
                            }.bind(this), 300);
                        }.bind(this));
                    }
                }
            }, this);

            // Handle form submission
            this.form.addEventListener('submit', function(e) {
                const isValid = this.validate();
                if (!isValid && this.options.autoSubmit) {
                    e.preventDefault();
                }
                // Dispatch custom event
                const event = new CustomEvent('form-validate', {
                    detail: { isValid: isValid, form: this.form }
                });
                this.form.dispatchEvent(event);
            }.bind(this));

            console.log('FormValidator initialized for:', this.form.id || 'unnamed form');
        }

        /**
         * Get validation rules for a field based on HTML attributes
         */
        getFieldRules(element) {
            const rules = {};

            // Check for required attribute
            if (element.hasAttribute('required')) {
                rules.required = true;
            }

            // Check for email type or data-validate="email"
            if (element.type === 'email' || element.dataset.validate === 'email') {
                rules.email = true;
            }

            // Check for password rules
            if (element.type === 'password' || element.dataset.validate === 'password') {
                rules.password = true;
            }

            // Check for minlength
            if (element.hasAttribute('minlength')) {
                rules.minLength = parseInt(element.getAttribute('minlength'));
            }

            // Check for maxlength
            if (element.hasAttribute('maxlength')) {
                rules.maxLength = parseInt(element.getAttribute('maxlength'));
            }

            // Check for match (password confirmation)
            if (element.dataset.match) {
                const matchField = document.getElementById(element.dataset.match) ||
                                  document.querySelector('[name="' + element.dataset.match + '"]');
                if (matchField) {
                    rules.match = matchField;
                }
            }

            // Check for phone
            if (element.dataset.validate === 'phone') {
                rules.phone = true;
            }

            // Check for numeric
            if (element.dataset.validate === 'numeric') {
                rules.numeric = true;
            }

            // Check for URL
            if (element.dataset.validate === 'url') {
                rules.url = true;
            }

            // Custom validation via data-validate-custom
            if (element.dataset.validateCustom) {
                try {
                    const customFn = new Function('value', 'return ' + element.dataset.validateCustom);
                    rules.custom = customFn;
                } catch (e) {
                    console.warn('Invalid custom validation for field:', element.name, e);
                }
            }

            return rules;
        }

        /**
         * Validate a single field
         */
        validateField(field) {
            const element = field.element;
            const value = this.getFieldValue(element);
            const rules = field.rules;

            let fieldIsValid = true;
            let errorMessage = '';

            // Check each rule
            for (const ruleName in rules) {
                const ruleValue = rules[ruleName];
                let isValid = true;

                switch (ruleName) {
                    case 'required':
                        isValid = VALIDATION_RULES.required(value);
                        if (!isValid) errorMessage = 'This field is required.';
                        break;
                    case 'email':
                        if (value.trim()) {
                            isValid = VALIDATION_RULES.email(value);
                            if (!isValid) errorMessage = 'Please enter a valid email address.';
                        }
                        break;
                    case 'password':
                        if (value) {
                            isValid = VALIDATION_RULES.password(value);
                            if (!isValid) errorMessage = 'Password must be at least 8 characters with letters and numbers.';
                        }
                        break;
                    case 'minLength':
                        if (value) {
                            isValid = VALIDATION_RULES.minLength(value, ruleValue);
                            if (!isValid) errorMessage = 'Minimum ' + ruleValue + ' characters required.';
                        }
                        break;
                    case 'maxLength':
                        if (value) {
                            isValid = VALIDATION_RULES.maxLength(value, ruleValue);
                            if (!isValid) errorMessage = 'Maximum ' + ruleValue + ' characters allowed.';
                        }
                        break;
                    case 'match':
                        if (value) {
                            const compareValue = this.getFieldValue(ruleValue);
                            isValid = VALIDATION_RULES.match(value, compareValue);
                            if (!isValid) errorMessage = 'Values do not match.';
                        }
                        break;
                    case 'phone':
                        if (value.trim()) {
                            isValid = VALIDATION_RULES.phone(value);
                            if (!isValid) errorMessage = 'Please enter a valid phone number.';
                        }
                        break;
                    case 'numeric':
                        if (value) {
                            isValid = VALIDATION_RULES.numeric(value);
                            if (!isValid) errorMessage = 'Please enter a number.';
                        }
                        break;
                    case 'url':
                        if (value.trim()) {
                            isValid = VALIDATION_RULES.url(value);
                            if (!isValid) errorMessage = 'Please enter a valid URL.';
                        }
                        break;
                    case 'custom':
                        try {
                            isValid = ruleValue(value);
                            if (!isValid) errorMessage = 'Invalid value.';
                        } catch (e) {
                            isValid = false;
                            errorMessage = 'Validation error.';
                        }
                        break;
                    default:
                        break;
                }

                if (!isValid) {
                    fieldIsValid = false;
                    break;
                }
            }

            // Update field state
            if (fieldIsValid) {
                this.clearError(field);
            } else {
                this.showError(field, errorMessage);
            }

            // Update the field's validity state
            field.element.setCustomValidity ? field.element.setCustomValidity(fieldIsValid ? '' : errorMessage) : null;
            field.element.classList.toggle('error', !fieldIsValid);

            return fieldIsValid;
        }

        /**
         * Validate all fields
         */
        validate() {
            this.errors = {};
            let allValid = true;

            this.fields.forEach(function(field) {
                const fieldValid = this.validateField(field);
                if (!fieldValid) {
                    allValid = false;
                    this.errors[field.name || field.element.id] = field.element.dataset.errorMessage || 'Invalid';
                }
            }, this);

            this.isValid = allValid;
            this.form.classList.toggle('valid', allValid);
            this.form.classList.toggle('invalid', !allValid);

            return allValid;
        }

        /**
         * Show error message for a field
         */
        showError(field, message) {
            const element = field.element;
            const formGroup = element.closest('.form-group');

            if (!this.options.showErrors) return;

            // Remove existing error message
            this.clearError(field);

            // Add error class to form group
            if (formGroup) {
                formGroup.classList.add(this.options.errorClass);
            }

            // Create error message element
            const errorEl = document.createElement('span');
            errorEl.className = this.options.errorMessageClass;
            errorEl.textContent = message || 'Invalid value.';
            errorEl.setAttribute('role', 'alert');

            // Insert after the input or inside form-group
            if (formGroup) {
                formGroup.appendChild(errorEl);
            } else {
                element.parentNode.insertBefore(errorEl, element.nextSibling);
            }

            element.setAttribute('aria-invalid', 'true');
            element.dataset.errorMessage = message || 'Invalid value.';
        }

        /**
         * Clear error message for a field
         */
        clearError(field) {
            const element = field.element;
            const formGroup = element.closest('.form-group');

            if (formGroup) {
                formGroup.classList.remove(this.options.errorClass);
                // Remove error message elements
                const errorMessages = formGroup.querySelectorAll('.' + this.options.errorMessageClass);
                errorMessages.forEach(function(el) {
                    el.remove();
                });
            } else {
                // Remove error message elements next to the element
                const errorMessages = element.parentNode.querySelectorAll('.' + this.options.errorMessageClass);
                errorMessages.forEach(function(el) {
                    el.remove();
                });
            }

            element.removeAttribute('aria-invalid');
            delete element.dataset.errorMessage;
        }

        /**
         * Get the value of a field element
         */
        getFieldValue(element) {
            if (element.type === 'checkbox' || element.type === 'radio') {
                return element.checked ? element.value : '';
            }
            if (element.tagName === 'SELECT') {
                return element.value || '';
            }
            return element.value || '';
        }

        /**
         * Get all form values as an object
         */
        getValues() {
            const values = {};
            this.fields.forEach(function(field) {
                const name = field.name || field.element.id || field.element.name;
                if (name) {
                    values[name] = this.getFieldValue(field.element);
                }
            }, this);
            return values;
        }

        /**
         * Reset the form and clear all errors
         */
        reset() {
            this.form.reset();
            this.fields.forEach(function(field) {
                this.clearError(field);
                field.element.classList.remove('error', 'success');
            }, this);
            this.errors = {};
            this.isValid = false;
            this.form.classList.remove('valid', 'invalid');
        }

        /**
         * Add a custom validation rule
         */
        static addRule(name, fn) {
            VALIDATION_RULES[name] = fn;
        }

        /**
         * Destroy the validator instance
         */
        destroy() {
            // Remove event listeners
            this.fields.forEach(function(field) {
                const element = field.element;
                element.removeEventListener('blur', this.validateField);
                element.removeEventListener('input', this.validateField);
                element.removeEventListener('change', this.validateField);
            }, this);
            this.form.removeEventListener('submit', this.validate);
            this._initialized = false;
            console.log('FormValidator destroyed for:', this.form.id || 'unnamed form');
        }
    }

    // ============================================
    // 3. SPECIFIC FORM HANDLERS
    // ============================================

    /**
     * Newsletter form handler
     */
    function initNewsletterForm() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;

        const messageEl = document.getElementById('newsletterMessage');

        const validator = new FormValidator(form, {
            validateOnBlur: true,
            validateOnInput: true,
            showErrors: true,
            autoSubmit: false
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const isValid = validator.validate();
            if (!isValid) {
                if (messageEl) {
                    messageEl.textContent = 'Please fix the errors above.';
                    messageEl.style.color = '#EF4444';
                }
                return;
            }

            const email = form.querySelector('input[type="email"]').value;

            // Simulate API call
            if (messageEl) {
                messageEl.textContent = 'Subscribing...';
                messageEl.style.color = '#A1A1AA';
            }

            // Fake delay
            setTimeout(function() {
                if (messageEl) {
                    messageEl.textContent = '✅ Subscribed successfully! Check your inbox.';
                    messageEl.style.color = '#10B981';
                }
                form.querySelector('input[type="email"]').value = '';
                validator.reset();

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.success('Subscribed successfully!');
                }
            }, 800);
        });

        console.log('Newsletter form initialized.');
        return validator;
    }

    /**
     * Contact form handler
     */
    function initContactForm() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        const validator = new FormValidator(form, {
            validateOnBlur: true,
            validateOnInput: true,
            showErrors: true,
            autoSubmit: false
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const isValid = validator.validate();
            if (!isValid) {
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.error('Please fix all errors before submitting.');
                }
                return;
            }

            const values = validator.getValues();

            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
            }

            // Simulate API call
            setTimeout(function() {
                if (submitBtn) {
                    submitBtn.textContent = '✓ Sent!';
                }

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.success('Your message has been sent. We\'ll get back to you soon!');
                }

                // Reset after delay
                setTimeout(function() {
                    form.reset();
                    validator.reset();
                    if (submitBtn) {
                        submitBtn.textContent = originalText || 'Send Message';
                        submitBtn.disabled = false;
                    }
                }, 2000);
            }, 1200);
        });

        console.log('Contact form initialized.');
        return validator;
    }

    /**
     * Login form handler
     */
    function initLoginForm() {
        const form = document.querySelector('.auth-form.login-form');
        if (!form) return;

        const validator = new FormValidator(form, {
            validateOnBlur: true,
            validateOnInput: false,
            showErrors: true,
            autoSubmit: false
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const isValid = validator.validate();
            if (!isValid) {
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.error('Please check your credentials and try again.');
                }
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.textContent = 'Logging in...';
                submitBtn.disabled = true;
            }

            // Simulate login
            setTimeout(function() {
                if (submitBtn) {
                    submitBtn.textContent = '✓ Success!';
                }

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.success('Welcome back! Redirecting...');
                }

                // Redirect after delay
                setTimeout(function() {
                    window.location.href = 'index.html';
                }, 1500);
            }, 1000);
        });

        console.log('Login form initialized.');
        return validator;
    }

    /**
     * Signup form handler
     */
    function initSignupForm() {
        const form = document.querySelector('.auth-form.signup-form');
        if (!form) return;

        // Add password match validation
        const passwordField = form.querySelector('input[type="password"]');
        const confirmField = form.querySelector('input[name="confirm_password"]');
        if (passwordField && confirmField) {
            confirmField.dataset.match = passwordField.id || passwordField.name;
        }

        const validator = new FormValidator(form, {
            validateOnBlur: true,
            validateOnInput: false,
            showErrors: true,
            autoSubmit: false
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const isValid = validator.validate();
            if (!isValid) {
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.error('Please fix all errors before signing up.');
                }
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.textContent = 'Creating account...';
                submitBtn.disabled = true;
            }

            // Simulate signup
            setTimeout(function() {
                if (submitBtn) {
                    submitBtn.textContent = '✓ Account created!';
                }

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.success('Account created successfully! Welcome to VisionAI.');
                }

                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 1500);
            }, 1200);
        });

        console.log('Signup form initialized.');
        return validator;
    }

    /**
     * Forgot password form handler
     */
    function initForgotPasswordForm() {
        const form = document.querySelector('.auth-form.forgot-form');
        if (!form) return;

        const validator = new FormValidator(form, {
            validateOnBlur: true,
            validateOnInput: true,
            showErrors: true,
            autoSubmit: false
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const isValid = validator.validate();
            if (!isValid) {
                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.error('Please enter a valid email address.');
                }
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
            }

            // Simulate password reset email
            setTimeout(function() {
                if (submitBtn) {
                    submitBtn.textContent = '✓ Email sent!';
                }

                if (window.VisionAI && window.VisionAI.Toast) {
                    window.VisionAI.Toast.success('Password reset link sent to your email.');
                }

                setTimeout(function() {
                    form.reset();
                    validator.reset();
                    if (submitBtn) {
                        submitBtn.textContent = originalText || 'Send Reset Link';
                        submitBtn.disabled = false;
                    }
                    // Redirect to login after a moment
                    setTimeout(function() {
                        window.location.href = 'login.html';
                    }, 2000);
                }, 1500);
            }, 1000);
        });

        console.log('Forgot password form initialized.');
        return validator;
    }

    // ============================================
    // 4. AUTO-INITIALIZE FORMS
    // ============================================

    function initAllForms() {
        // Newsletter
        initNewsletterForm();

        // Contact
        initContactForm();

        // Login
        initLoginForm();

        // Signup
        initSignupForm();

        // Forgot Password
        initForgotPasswordForm();

        // Any additional forms with class .auto-validate
        document.querySelectorAll('.auto-validate').forEach(function(form) {
            // Check if it's not already handled by a specific handler
            const formId = form.id;
            if (!formId || !['newsletterForm', 'contactForm', 'loginForm', 'signupForm', 'forgotForm'].includes(formId)) {
                new FormValidator(form, {
                    validateOnBlur: true,
                    validateOnInput: false,
                    showErrors: true,
                    autoSubmit: true
                });
            }
        });

        console.log('All forms initialized.');
    }

    // ============================================
    // 5. EXPOSE PUBLIC API
    // ============================================

    window.FormValidator = FormValidator;
    window.Forms = {
        init: initAllForms,
        initNewsletter: initNewsletterForm,
        initContact: initContactForm,
        initLogin: initLoginForm,
        initSignup: initSignupForm,
        initForgot: initForgotPasswordForm,
        Validator: FormValidator
    };

    // ============================================
    // 6. INITIALIZE
    // ============================================

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAllForms);
        } else {
            initAllForms();
        }
    }

    init();

    console.log('Forms module loaded.');

})();