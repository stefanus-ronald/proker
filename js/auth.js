// Authentication logic

const auth = {
    // Check if user is logged in
    isLoggedIn() {
        const user = storage.getCurrentUser();
        const session = storage.get(storage.keys.SESSION);
        
        return !!(user && session && session.token);
    },
    
    // Login
    async login(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner spinner-sm" style="margin: 0 auto;"></div>';
        
        // Simulate API call
        setTimeout(() => {
            // For demo, accept any email/password
            if (email && password) {
                const user = {
                    id: '1',
                    name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
                    email: email,
                    role: 'admin',
                    avatar: '',
                    createdAt: new Date().toISOString(),
                    preferences: {
                        theme: 'light',
                        notifications: true
                    }
                };
                
                // Save user and session
                storage.setCurrentUser(user);
                storage.set(storage.keys.SESSION, {
                    token: utils.generateId(),
                    expiresAt: new Date(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000).toISOString()
                });
                
                // Initialize data if needed
                storage.init();
                
                utils.showToast('Login successful!', 'success');
                app.navigateTo('dashboard');
            } else {
                utils.showToast('Invalid email or password', 'destructive');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }, 1000);
    },
    
    // Register
    async register(event) {
        event.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const agreeTerms = document.getElementById('agree-terms').checked;
        
        // Validate inputs
        if (!utils.validateEmail(email)) {
            utils.showToast('Please enter a valid email address', 'destructive');
            return;
        }
        
        if (password !== confirmPassword) {
            utils.showToast('Passwords do not match', 'destructive');
            return;
        }
        
        const passwordStrength = utils.validatePassword(password);
        if (passwordStrength.score < 3) {
            utils.showToast(passwordStrength.message, 'destructive');
            return;
        }
        
        if (!agreeTerms) {
            utils.showToast('Please agree to the terms and conditions', 'destructive');
            return;
        }
        
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner spinner-sm" style="margin: 0 auto;"></div>';
        
        // Simulate API call
        setTimeout(() => {
            const user = {
                id: utils.generateId(),
                name: name,
                email: email,
                role: 'member',
                avatar: '',
                createdAt: new Date().toISOString(),
                preferences: {
                    theme: 'light',
                    notifications: true
                }
            };
            
            // Save user and session
            storage.setCurrentUser(user);
            storage.set(storage.keys.SESSION, {
                token: utils.generateId(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            });
            
            // Initialize data
            storage.init();
            
            utils.showToast('Account created successfully!', 'success');
            app.navigateTo('dashboard');
        }, 1000);
    },
    
    // Forgot password
    async forgotPassword(event) {
        event.preventDefault();
        
        const email = document.getElementById('reset-email').value;
        
        if (!utils.validateEmail(email)) {
            utils.showToast('Please enter a valid email address', 'destructive');
            return;
        }
        
        // Show loading state
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="spinner spinner-sm" style="margin: 0 auto;"></div>';
        
        // Simulate API call
        setTimeout(() => {
            app.showScreen('reset-success-screen');
        }, 1000);
    },
    
    // Login with Google
    loginWithGoogle() {
        utils.showToast('Google login coming soon!', 'info');
    },
    
    // Logout
    logout() {
        // Clear user data
        storage.remove(storage.keys.USER);
        storage.remove(storage.keys.SESSION);
        
        utils.showToast('Logged out successfully', 'success');
        app.navigateTo('login');
    },
    
    // Check session validity
    checkSession() {
        const session = storage.get(storage.keys.SESSION);
        
        if (!session || !session.token || !session.expiresAt) {
            return false;
        }
        
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();
        
        if (now > expiresAt) {
            this.logout();
            return false;
        }
        
        return true;
    },
    
    // Update password strength indicator
    updatePasswordStrength(inputId) {
        const password = document.getElementById(inputId).value;
        const strengthIndicator = document.getElementById('password-strength');
        
        if (!password) {
            strengthIndicator.textContent = '';
            return;
        }
        
        const strength = utils.validatePassword(password);
        
        let color = 'var(--destructive)';
        if (strength.score >= 3 && strength.score < 5) {
            color = 'var(--warning)';
        } else if (strength.score >= 5) {
            color = 'var(--success)';
        }
        
        strengthIndicator.style.color = color;
        strengthIndicator.textContent = strength.message;
    }
};

// Add password strength listener when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('register-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            auth.updatePasswordStrength('register-password');
        });
    }
});