// Utility functions

const utils = {
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Format date
    formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    },
    
    // Format relative time
    formatRelativeTime(date) {
        const now = new Date();
        const then = new Date(date);
        const diff = now - then;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        return this.formatDate(date);
    },
    
    // Format percentage
    formatPercentage(value, total) {
        if (!total) return 0;
        return Math.round((value / total) * 100);
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Throttle function
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} animate-slideInUp`;
        toast.style.cssText = `
            position: fixed;
            bottom: 90px;
            left: 50%;
            transform: translateX(-50%);
            max-width: 350px;
            z-index: 1000;
            box-shadow: var(--shadow-lg);
        `;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <div class="alert-icon">${icon}</div>
            <div>${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('animate-slideOutDown');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // Get toast icon based on type
    getToastIcon(type) {
        const icons = {
            'success': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
            'warning': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            'destructive': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            'info': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
        };
        return icons[type] || icons.info;
    },
    
    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validate password strength
    validatePassword(password) {
        const strength = {
            score: 0,
            message: ''
        };
        
        if (password.length < 8) {
            strength.message = 'Password must be at least 8 characters';
            return strength;
        }
        
        // Length score
        if (password.length >= 8) strength.score += 1;
        if (password.length >= 12) strength.score += 1;
        
        // Character variety score
        if (/[a-z]/.test(password)) strength.score += 1;
        if (/[A-Z]/.test(password)) strength.score += 1;
        if (/[0-9]/.test(password)) strength.score += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength.score += 1;
        
        // Set message based on score
        if (strength.score < 3) {
            strength.message = 'Weak password';
        } else if (strength.score < 5) {
            strength.message = 'Medium strength';
        } else {
            strength.message = 'Strong password';
        }
        
        return strength;
    },
    
    // Show loading spinner
    showLoading(container) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-container';
        spinner.innerHTML = '<div class="spinner"></div>';
        spinner.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            padding: var(--space-8);
        `;
        
        if (container) {
            container.innerHTML = '';
            container.appendChild(spinner);
        } else {
            return spinner;
        }
    },
    
    // Hide loading spinner
    hideLoading(container) {
        const spinner = container.querySelector('.loading-container');
        if (spinner) {
            spinner.remove();
        }
    },
    
    // Create skeleton loader
    createSkeleton(type = 'text', count = 3) {
        let skeleton = '';
        
        for (let i = 0; i < count; i++) {
            if (type === 'text') {
                skeleton += '<div class="skeleton skeleton-text"></div>';
            } else if (type === 'card') {
                skeleton += '<div class="skeleton skeleton-card"></div>';
            }
        }
        
        return skeleton;
    },
    
    // Get greeting based on time
    getGreeting() {
        const hour = new Date().getHours();
        
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    },
    
    // Animate counter
    animateCounter(element, target, duration = 1000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            element.textContent = Math.round(current);
        }, 16);
    },
    
    // Check if element is in viewport
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};