// Client-side routing

const router = {
    // Current route
    currentRoute: null,
    
    // Route definitions
    routes: {
        '/': 'dashboard',
        '/dashboard': 'dashboard',
        '/projects': 'projects',
        '/projects/:id': 'project-detail',
        '/tasks': 'tasks',
        '/tasks/:id': 'task-detail',
        '/profile': 'profile',
        '/settings': 'settings',
        '/login': 'login',
        '/register': 'register',
        '/forgot-password': 'forgot-password',
        '/onboarding': 'onboarding'
    },
    
    // Initialize router
    init() {
        console.log('Router: Initializing...');
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            console.log('Router: Hash changed to', window.location.hash);
            this.handleRoute();
        });
        
        // Handle initial route
        console.log('Router: Handling initial route');
        this.handleRoute();
    },
    
    // Handle route change
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        const route = this.parseRoute(hash);
        
        // Check authentication for protected routes
        if (this.isProtectedRoute(route.path) && !auth.isLoggedIn()) {
            this.navigate('/login');
            return;
        }
        
        // Check if user is logged in and trying to access auth pages
        if (this.isAuthRoute(route.path) && auth.isLoggedIn()) {
            this.navigate('/dashboard');
            return;
        }
        
        // Update current route
        this.currentRoute = route;
        
        // Load the appropriate screen
        this.loadScreen(route);
    },
    
    // Parse route
    parseRoute(hash) {
        const parts = hash.split('/').filter(Boolean);
        let path = '/' + parts.join('/');
        const params = {};
        
        // Find matching route
        for (const [pattern, name] of Object.entries(this.routes)) {
            const regex = this.createRouteRegex(pattern);
            const match = path.match(regex);
            
            if (match) {
                // Extract parameters
                const paramNames = pattern.match(/:(\w+)/g);
                if (paramNames) {
                    paramNames.forEach((paramName, index) => {
                        const key = paramName.slice(1);
                        params[key] = match[index + 1];
                    });
                }
                
                return { path, name, params };
            }
        }
        
        // Default to dashboard if no match
        return { path: '/', name: 'dashboard', params: {} };
    },
    
    // Create regex from route pattern
    createRouteRegex(pattern) {
        const regexPattern = pattern
            .replace(/\//g, '\\/')
            .replace(/:(\w+)/g, '([^/]+)');
        return new RegExp(`^${regexPattern}$`);
    },
    
    // Check if route is protected
    isProtectedRoute(path) {
        const publicRoutes = ['/login', '/register', '/forgot-password', '/onboarding'];
        return !publicRoutes.includes(path);
    },
    
    // Check if route is auth route
    isAuthRoute(path) {
        const authRoutes = ['/login', '/register', '/forgot-password'];
        return authRoutes.includes(path);
    },
    
    // Navigate to route
    navigate(path) {
        window.location.hash = path;
    },
    
    // Load screen based on route
    async loadScreen(route) {
        console.log('Router: Loading screen for route:', route);
        
        const container = document.getElementById('app-content');
        const bottomNav = document.getElementById('bottom-nav');
        
        if (!container) {
            console.error('Router: app-content container not found!');
            return;
        }
        
        // Show loading
        if (typeof utils !== 'undefined' && utils.showLoading) {
            utils.showLoading(container);
        } else {
            container.innerHTML = '<div style="text-align: center; padding: 20px;">Loading...</div>';
        }
        
        try {
            let content = '';
            
            switch (route.name) {
                case 'dashboard':
                    content = await this.loadHTML('screens/dashboard.html');
                    bottomNav.style.display = 'flex';
                    this.updateActiveNavItem('dashboard');
                    // Initialize dashboard after loading
                    setTimeout(() => this.initializeDashboard(), 100);
                    break;
                    
                case 'projects':
                    content = await this.loadHTML('screens/projects.html');
                    bottomNav.style.display = 'flex';
                    this.updateActiveNavItem('projects');
                    break;
                    
                case 'project-detail':
                    content = await this.loadProjectDetail(route.params.id);
                    bottomNav.style.display = 'flex';
                    break;
                    
                case 'tasks':
                    content = await this.loadHTML('screens/tasks.html');
                    bottomNav.style.display = 'flex';
                    this.updateActiveNavItem('tasks');
                    break;
                    
                case 'profile':
                    content = await this.loadHTML('screens/profile.html');
                    bottomNav.style.display = 'flex';
                    this.updateActiveNavItem('profile');
                    break;
                    
                case 'login':
                    content = await this.loadAuthScreen('login');
                    bottomNav.style.display = 'none';
                    break;
                    
                case 'register':
                    content = await this.loadAuthScreen('register');
                    bottomNav.style.display = 'none';
                    break;
                    
                case 'forgot-password':
                    content = await this.loadAuthScreen('forgot-password');
                    bottomNav.style.display = 'none';
                    break;
                    
                case 'onboarding':
                    content = await this.loadHTML('screens/onboarding.html');
                    bottomNav.style.display = 'none';
                    setTimeout(() => app.showOnboardingSplash(), 100);
                    break;
                    
                default:
                    content = '<div class="empty-state"><h2>Page not found</h2></div>';
                    bottomNav.style.display = 'flex';
            }
            
            // Update content with animation
            container.style.opacity = '0';
            setTimeout(() => {
                container.innerHTML = content;
                container.style.opacity = '1';
            }, 200);
            
        } catch (error) {
            console.error('Error loading screen:', error);
            container.innerHTML = '<div class="empty-state"><h2>Error loading page</h2></div>';
        }
    },
    
    // Load HTML file
    async loadHTML(path) {
        console.log('Loading screen from path:', path);
        
        // Always use inline HTML generation
        if (path.includes('dashboard')) {
            return this.getDashboardHTML();
        } else if (path.includes('projects')) {
            return this.getProjectsHTML();
        } else if (path.includes('tasks')) {
            return this.getTasksHTML();
        } else if (path.includes('profile')) {
            return this.getProfileHTML();
        } else if (path.includes('onboarding')) {
            return this.getOnboardingHTML();
        }
        
        return '<div class="screen"><h2>Coming soon...</h2></div>';
    },
    
    // Load auth screen
    async loadAuthScreen(type) {
        const authHTML = this.getAuthHTML();
        const parser = new DOMParser();
        const doc = parser.parseFromString(authHTML, 'text/html');
        
        // Show only the requested auth screen
        const screens = doc.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.style.display = 'none';
        });
        
        const targetScreen = doc.getElementById(`${type}-screen`);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
        }
        
        return doc.body.innerHTML;
    },
    
    // Get Auth HTML
    getAuthHTML() {
        return `
            <!-- Login Screen -->
            <div class="screen auth-screen" id="login-screen">
                <div class="auth-header">
                    <h1 class="auth-title">Welcome Back</h1>
                    <p class="auth-subtitle">Sign in to continue to ProKer</p>
                </div>
                
                <form class="auth-form" id="login-form" onsubmit="auth.login(event)">
                    <div class="form-group">
                        <label class="label" for="login-email">Email</label>
                        <input type="email" class="input" id="login-email" placeholder="Enter your email" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="label" for="login-password">Password</label>
                        <input type="password" class="input" id="login-password" placeholder="Enter your password" required>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox">
                            <input type="checkbox" id="remember-me">
                            <label class="checkbox-label" for="remember-me">Remember me</label>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">Sign In</button>
                    
                    <div class="auth-divider">
                        <div class="auth-divider-line"></div>
                        <span class="auth-divider-text">or</span>
                        <div class="auth-divider-line"></div>
                    </div>
                    
                    <button type="button" class="btn btn-outline btn-full" onclick="auth.loginWithGoogle()">
                        <svg class="mr-2" width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Continue with Google
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p>Don't have an account? <a href="#/register" class="auth-link">Sign Up</a></p>
                    <p class="mt-2"><a href="#/forgot-password" class="auth-link">Forgot Password?</a></p>
                </div>
            </div>

            <!-- Register Screen -->
            <div class="screen auth-screen" id="register-screen" style="display: none;">
                <div class="auth-header">
                    <h1 class="auth-title">Create Account</h1>
                    <p class="auth-subtitle">Sign up to get started with ProKer</p>
                </div>
                
                <form class="auth-form" id="register-form" onsubmit="auth.register(event)">
                    <div class="form-group">
                        <label class="label" for="register-name">Full Name</label>
                        <input type="text" class="input" id="register-name" placeholder="Enter your full name" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="label" for="register-email">Email</label>
                        <input type="email" class="input" id="register-email" placeholder="Enter your email" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="label" for="register-password">Password</label>
                        <input type="password" class="input" id="register-password" placeholder="Create a password" required>
                        <div class="form-error" id="password-strength"></div>
                    </div>
                    
                    <div class="form-group">
                        <label class="label" for="register-confirm-password">Confirm Password</label>
                        <input type="password" class="input" id="register-confirm-password" placeholder="Confirm your password" required>
                    </div>
                    
                    <div class="form-group">
                        <div class="checkbox">
                            <input type="checkbox" id="agree-terms" required>
                            <label class="checkbox-label" for="agree-terms">I agree to the Terms and Conditions</label>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">Create Account</button>
                </form>
                
                <div class="auth-footer">
                    <p>Already have an account? <a href="#/login" class="auth-link">Sign In</a></p>
                </div>
            </div>

            <!-- Forgot Password Screen -->
            <div class="screen auth-screen" id="forgot-password-screen" style="display: none;">
                <div class="auth-header">
                    <h1 class="auth-title">Reset Password</h1>
                    <p class="auth-subtitle">Enter your email to receive reset instructions</p>
                </div>
                
                <form class="auth-form" id="forgot-password-form" onsubmit="auth.forgotPassword(event)">
                    <div class="form-group">
                        <label class="label" for="reset-email">Email</label>
                        <input type="email" class="input" id="reset-email" placeholder="Enter your email" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">Send Reset Link</button>
                </form>
                
                <div class="auth-footer">
                    <p>Remember your password? <a href="#/login" class="auth-link">Sign In</a></p>
                </div>
            </div>

            <!-- Password Reset Success -->
            <div class="screen auth-screen" id="reset-success-screen" style="display: none;">
                <div class="empty-state">
                    <div class="empty-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h2 class="empty-title">Check Your Email</h2>
                    <p class="empty-description">We've sent password reset instructions to your email address.</p>
                    <button class="btn btn-primary" onclick="app.navigateTo('login')">Back to Login</button>
                </div>
            </div>
        `;
    },
    
    // Load project detail
    async loadProjectDetail(projectId) {
        const project = storage.getProjectById(projectId);
        
        if (!project) {
            return '<div class="empty-state"><h2>Project not found</h2></div>';
        }
        
        // Generate project detail HTML
        return `
            <div class="screen">
                <h2>${project.name}</h2>
                <p>${project.description}</p>
                <!-- Add more project details here -->
            </div>
        `;
    },
    
    // Update active navigation item
    updateActiveNavItem(route) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            if (item.dataset.route === route) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },
    
    // Initialize dashboard
    initializeDashboard() {
        const user = storage.getCurrentUser();
        
        // Update greeting
        const greeting = utils.getGreeting();
        const greetingEl = document.querySelector('.dashboard-greeting');
        if (greetingEl && user) {
            greetingEl.innerHTML = `${greeting}, <span id="user-name">${user.name}</span>! 👋`;
        }
        
        // Animate statistics
        const stats = {
            'total-projects': storage.getProjects().length,
            'active-tasks': storage.getTasks().filter(t => t.status !== 'done').length,
            'team-members': 8, // Mock data
            'completion-rate': 78 // Mock data
        };
        
        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'completion-rate') {
                    utils.animateCounter(element, value);
                    element.textContent = value + '%';
                } else {
                    utils.animateCounter(element, value);
                }
            }
        });
        
        // Load recent projects
        this.loadRecentProjects();
        
        // Load upcoming tasks
        this.loadUpcomingTasks();
    },
    
    // Load recent projects
    loadRecentProjects() {
        const container = document.getElementById('recent-projects-list');
        if (!container) return;
        
        const recentProjects = projects.getRecent(2);
        
        if (recentProjects.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: var(--space-8) 0;">
                    <p class="text-muted text-center">No projects yet. Create your first project!</p>
                </div>
            `;
        } else {
            container.innerHTML = recentProjects.map(project => 
                projects.renderProjectCard(project)
            ).join('');
        }
    },
    
    // Load upcoming tasks
    loadUpcomingTasks() {
        const container = document.getElementById('upcoming-tasks-list');
        if (!container) return;
        
        const upcomingTasks = tasks.getUpcoming(3);
        
        if (upcomingTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: var(--space-8) 0;">
                    <p class="text-muted text-center">No upcoming tasks. You're all caught up!</p>
                </div>
            `;
        } else {
            container.innerHTML = upcomingTasks.map(task => 
                tasks.renderTaskItem(task)
            ).join('');
        }
    },
    
    // Get Dashboard HTML
    getDashboardHTML() {
        const user = storage.getCurrentUser() || { name: 'User' };
        const greeting = utils.getGreeting();
        
        return `
            <div class="screen" id="dashboard-screen">
                <!-- Header -->
                <div class="dashboard-header">
                    <h1 class="dashboard-greeting">${greeting}, <span id="user-name">${user.name}</span>! 👋</h1>
                    <p class="dashboard-subtitle">Here's your project overview</p>
                </div>
                
                <!-- Statistics Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="total-projects">0</div>
                        <div class="stat-label">Total Projects</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4"></path>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="active-tasks">0</div>
                        <div class="stat-label">Active Tasks</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div class="stat-value" id="team-members">0</div>
                        <div class="stat-label">Team Members</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                        </div>
                        <div class="stat-value" id="completion-rate">0%</div>
                        <div class="stat-label">Completion Rate</div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="quick-actions">
                    <h3 class="quick-actions-title">Quick Actions</h3>
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" onclick="app.showCreateProject()">
                            <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2v20M2 12h20"></path>
                            </svg>
                            <span class="quick-action-label">New Project</span>
                        </button>
                        
                        <button class="quick-action-btn" onclick="app.showCreateTask()">
                            <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4"></path>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                            </svg>
                            <span class="quick-action-label">Add Task</span>
                        </button>
                        
                        <button class="quick-action-btn" onclick="app.navigateTo('team')">
                            <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="8.5" cy="7" r="4"></circle>
                                <line x1="20" y1="8" x2="20" y2="14"></line>
                                <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            <span class="quick-action-label">Invite Team</span>
                        </button>
                    </div>
                </div>
                
                <!-- Recent Projects -->
                <div class="recent-section">
                    <div class="section-header">
                        <h3 class="section-title">Recent Projects</h3>
                        <a href="#/projects" class="section-link">View all</a>
                    </div>
                    <div id="recent-projects-list">
                        ${utils.createSkeleton('card', 2)}
                    </div>
                </div>
                
                <!-- Upcoming Deadlines -->
                <div class="recent-section">
                    <div class="section-header">
                        <h3 class="section-title">Upcoming Deadlines</h3>
                        <a href="#/tasks" class="section-link">View all</a>
                    </div>
                    <div class="task-list" id="upcoming-tasks-list">
                        ${utils.createSkeleton('text', 3)}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Get Projects HTML
    getProjectsHTML() {
        const projectsList = projects.getAll();
        
        return `
            <div class="screen" id="projects-screen">
                <div class="screen-header" style="margin-bottom: var(--space-6);">
                    <h1 class="text-2xl font-bold">Projects</h1>
                    <button class="btn btn-primary btn-sm" onclick="app.showCreateProject()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-2);">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Project
                    </button>
                </div>
                
                ${projectsList.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <h2 class="empty-title">No projects yet</h2>
                        <p class="empty-description">Create your first project to get started</p>
                        <button class="btn btn-primary" onclick="app.showCreateProject()">Create Project</button>
                    </div>
                ` : `
                    <div class="projects-list">
                        ${projectsList.map(project => projects.renderProjectCard(project)).join('')}
                    </div>
                `}
            </div>
        `;
    },
    
    // Get Tasks HTML
    getTasksHTML() {
        const tasksList = tasks.getAll();
        
        return `
            <div class="screen" id="tasks-screen">
                <div class="screen-header" style="margin-bottom: var(--space-6);">
                    <h1 class="text-2xl font-bold">Tasks</h1>
                    <button class="btn btn-primary btn-sm" onclick="app.showCreateTask()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: var(--space-2);">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New Task
                    </button>
                </div>
                
                ${tasksList.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 11l3 3L22 4"></path>
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                            </svg>
                        </div>
                        <h2 class="empty-title">No tasks yet</h2>
                        <p class="empty-description">Create your first task to get started</p>
                        <button class="btn btn-primary" onclick="app.showCreateTask()">Create Task</button>
                    </div>
                ` : `
                    <div class="task-list">
                        ${tasksList.map(task => tasks.renderTaskItem(task, true)).join('')}
                    </div>
                `}
            </div>
        `;
    },
    
    // Get Profile HTML
    getProfileHTML() {
        const user = storage.getCurrentUser() || { name: 'User', email: 'user@example.com' };
        const projectStats = projects.getStatistics();
        const taskStats = tasks.getStatistics();
        
        return `
            <div class="screen" id="profile-screen">
                <div class="profile-header">
                    <div class="profile-avatar">${user.name.charAt(0).toUpperCase()}</div>
                    <h2 class="profile-name">${user.name}</h2>
                    <p class="profile-email">${user.email}</p>
                </div>
                
                <div class="profile-stats">
                    <div class="profile-stat">
                        <div class="profile-stat-value">${projectStats.total}</div>
                        <div class="profile-stat-label">Projects</div>
                    </div>
                    <div class="profile-stat">
                        <div class="profile-stat-value">${taskStats.done}</div>
                        <div class="profile-stat-label">Completed</div>
                    </div>
                    <div class="profile-stat">
                        <div class="profile-stat-value">${taskStats.total - taskStats.done}</div>
                        <div class="profile-stat-label">Pending</div>
                    </div>
                </div>
                
                <div class="menu-list">
                    <div class="menu-item" onclick="app.navigateTo('settings')">
                        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                        </svg>
                        <span class="menu-label">Settings</span>
                        <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    
                    <div class="menu-item" onclick="utils.showToast('Coming soon!', 'info')">
                        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        <span class="menu-label">Reports</span>
                        <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    
                    <div class="menu-item" onclick="app.exportData()">
                        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span class="menu-label">Export Data</span>
                        <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    
                    <div class="menu-item" onclick="utils.showToast('Coming soon!', 'info')">
                        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 20h9"></path>
                            <path d="M12 4h9"></path>
                            <path d="M5 20l5-8-5-8"></path>
                        </svg>
                        <span class="menu-label">About</span>
                        <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                    
                    <div class="menu-item" onclick="auth.logout()" style="color: var(--destructive);">
                        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        <span class="menu-label">Logout</span>
                        <svg class="menu-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Get Onboarding HTML
    getOnboardingHTML() {
        // Read from the actual file content
        return `
            <!-- Splash Screen -->
            <div class="screen onboarding-screen" id="splash-screen">
                <div class="onboarding-logo">PK</div>
                <h1 class="onboarding-title">ProKer</h1>
                <p class="onboarding-description">Project Management Made Simple</p>
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>

            <!-- Welcome Screen 1 -->
            <div class="screen onboarding-screen" id="welcome-1" style="display: none;">
                <div class="onboarding-illustration">
                    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="40" y="40" width="200" height="120" rx="8" fill="var(--muted)"/>
                        <rect x="60" y="60" width="160" height="20" rx="4" fill="var(--border)"/>
                        <rect x="60" y="90" width="120" height="16" rx="4" fill="var(--border)"/>
                        <rect x="60" y="116" width="140" height="16" rx="4" fill="var(--border)"/>
                        <circle cx="220" cy="140" r="30" fill="var(--primary)"/>
                        <path d="M210 140L215 145L230 130" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h2 class="onboarding-title">Manage Your Projects</h2>
                <p class="onboarding-description">Keep track of all your projects in one place. Set deadlines, assign team members, and monitor progress effortlessly.</p>
                <div class="onboarding-dots">
                    <div class="onboarding-dot active"></div>
                    <div class="onboarding-dot"></div>
                    <div class="onboarding-dot"></div>
                </div>
                <button class="btn btn-primary btn-full" onclick="app.showOnboardingScreen(2)">Next</button>
            </div>

            <!-- Welcome Screen 2 -->
            <div class="screen onboarding-screen" id="welcome-2" style="display: none;">
                <div class="onboarding-illustration">
                    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="40" y="40" width="60" height="60" rx="8" fill="var(--muted)"/>
                        <rect x="110" y="40" width="60" height="60" rx="8" fill="var(--muted)"/>
                        <rect x="180" y="40" width="60" height="60" rx="8" fill="var(--muted)"/>
                        <rect x="40" y="110" width="60" height="60" rx="8" fill="var(--muted)"/>
                        <rect x="110" y="110" width="60" height="60" rx="8" fill="var(--primary)" opacity="0.2"/>
                        <rect x="180" y="110" width="60" height="60" rx="8" fill="var(--muted)"/>
                        <circle cx="140" cy="140" r="20" fill="var(--primary)"/>
                        <path d="M140 130V150M130 140H150" stroke="white" stroke-width="3" stroke-linecap="round"/>
                    </svg>
                </div>
                <h2 class="onboarding-title">Collaborate with Your Team</h2>
                <p class="onboarding-description">Work together seamlessly. Share updates, assign tasks, and communicate with your team all in one app.</p>
                <div class="onboarding-dots">
                    <div class="onboarding-dot"></div>
                    <div class="onboarding-dot active"></div>
                    <div class="onboarding-dot"></div>
                </div>
                <button class="btn btn-primary btn-full" onclick="app.showOnboardingScreen(3)">Next</button>
            </div>

            <!-- Welcome Screen 3 -->
            <div class="screen onboarding-screen" id="welcome-3" style="display: none;">
                <div class="onboarding-illustration">
                    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="60" y="40" width="160" height="100" rx="8" fill="var(--muted)"/>
                        <rect x="80" y="60" width="120" height="8" rx="4" fill="var(--primary)" opacity="0.3"/>
                        <rect x="80" y="76" width="80" height="8" rx="4" fill="var(--primary)" opacity="0.5"/>
                        <rect x="80" y="92" width="100" height="8" rx="4" fill="var(--primary)" opacity="0.7"/>
                        <rect x="80" y="108" width="60" height="8" rx="4" fill="var(--primary)"/>
                        <circle cx="140" cy="160" r="20" fill="var(--success)"/>
                        <path d="M130 160L135 165L150 150" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h2 class="onboarding-title">Track Progress</h2>
                <p class="onboarding-description">Stay on top of deadlines and milestones. Get real-time updates on project progress and team productivity.</p>
                <div class="onboarding-dots">
                    <div class="onboarding-dot"></div>
                    <div class="onboarding-dot"></div>
                    <div class="onboarding-dot active"></div>
                </div>
                <button class="btn btn-primary btn-full" onclick="app.navigateTo('login')">Get Started</button>
            </div>
        `;
    }
};