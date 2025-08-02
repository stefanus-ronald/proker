// Main application initialization

const app = {
    // Initialize app
    init() {
        // Check if first time user
        const hasSeenOnboarding = localStorage.getItem('proker_onboarding_complete');
        
        // Initialize storage
        storage.init();
        
        // Initialize router
        router.init();
        
        // Check authentication
        if (!auth.isLoggedIn() && !hasSeenOnboarding) {
            this.navigateTo('onboarding');
        } else if (!auth.isLoggedIn()) {
            this.navigateTo('login');
        }
        
        // Set up global event listeners
        this.setupEventListeners();
        
        // Check session periodically
        setInterval(() => {
            if (auth.isLoggedIn()) {
                auth.checkSession();
            }
        }, 60000); // Check every minute
    },
    
    // Navigate to route
    navigateTo(route) {
        router.navigate(route.startsWith('/') ? route : `/${route}`);
    },
    
    // Show specific screen
    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.style.display = 'none';
        });
        
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.style.display = 'flex';
            targetScreen.classList.add('animate-fadeIn');
        }
    },
    
    // Setup global event listeners
    setupEventListeners() {
        // Handle back button
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal-backdrop');
                const sheets = document.querySelectorAll('.bottom-sheet');
                
                if (modals.length > 0) {
                    ui.closeModal();
                } else if (sheets.length > 0) {
                    ui.closeBottomSheet();
                }
            }
        });
        
        // Handle offline/online
        window.addEventListener('online', () => {
            utils.showToast('Back online!', 'success');
        });
        
        window.addEventListener('offline', () => {
            utils.showToast('You are offline. Some features may be limited.', 'warning');
        });
        
        // Handle viewport resize
        let viewportHeight = window.innerHeight;
        window.addEventListener('resize', () => {
            if (window.innerHeight !== viewportHeight) {
                viewportHeight = window.innerHeight;
                document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
            }
        });
        
        // Set initial viewport height
        document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
    },
    
    // Onboarding functions
    showOnboardingSplash() {
        setTimeout(() => {
            this.showScreen('welcome-1');
        }, 2000);
    },
    
    showOnboardingScreen(screenNumber) {
        this.showScreen(`welcome-${screenNumber}`);
    },
    
    completeOnboarding() {
        localStorage.setItem('proker_onboarding_complete', 'true');
        this.navigateTo('login');
    },
    
    // Show add menu
    showAddMenu() {
        const content = `
            <div class="quick-actions-grid" style="padding: var(--space-4) 0;">
                <button class="quick-action-btn" onclick="app.showCreateProject(); ui.closeBottomSheet();">
                    <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span class="quick-action-label">New Project</span>
                </button>
                
                <button class="quick-action-btn" onclick="app.showCreateTask(); ui.closeBottomSheet();">
                    <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 11l3 3L22 4"></path>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
                    </svg>
                    <span class="quick-action-label">New Task</span>
                </button>
                
                <button class="quick-action-btn" onclick="ui.closeBottomSheet();">
                    <svg class="quick-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    <span class="quick-action-label">Cancel</span>
                </button>
            </div>
        `;
        
        ui.showBottomSheet(content, '200px');
    },
    
    // Show create project form
    showCreateProject() {
        const content = `
            <h3 class="font-semibold mb-4">Create New Project</h3>
            <form id="create-project-form" onsubmit="app.handleCreateProject(event)">
                <div class="form-group">
                    <label class="label" for="project-name">Project Name</label>
                    <input type="text" class="input" id="project-name" placeholder="Enter project name" required>
                </div>
                
                <div class="form-group">
                    <label class="label" for="project-description">Description</label>
                    <textarea class="textarea" id="project-description" placeholder="Enter project description"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="label" for="project-deadline">Deadline</label>
                    <input type="date" class="input" id="project-deadline" required>
                </div>
                
                <div class="form-group">
                    <label class="label" for="project-priority">Priority</label>
                    <select class="select" id="project-priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                
                <button type="submit" class="btn btn-primary btn-full">Create Project</button>
            </form>
        `;
        
        ui.showModal('Create New Project', content);
    },
    
    // Handle create project
    handleCreateProject(event) {
        event.preventDefault();
        
        const projectData = {
            name: document.getElementById('project-name').value,
            description: document.getElementById('project-description').value,
            deadline: document.getElementById('project-deadline').value,
            priority: document.getElementById('project-priority').value,
            status: 'active'
        };
        
        const project = projects.create(projectData);
        if (project) {
            ui.closeModal();
            this.navigateTo(`projects/${project.id}`);
        }
    },
    
    // Show create task form
    showCreateTask() {
        const projectsList = projects.getAll();
        const projectOptions = projectsList.map(p => 
            `<option value="${p.id}">${p.name}</option>`
        ).join('');
        
        const content = `
            <h3 class="font-semibold mb-4">Create New Task</h3>
            <form id="create-task-form" onsubmit="app.handleCreateTask(event)">
                <div class="form-group">
                    <label class="label" for="task-title">Task Title</label>
                    <input type="text" class="input" id="task-title" placeholder="Enter task title" required>
                </div>
                
                <div class="form-group">
                    <label class="label" for="task-description">Description</label>
                    <textarea class="textarea" id="task-description" placeholder="Enter task description"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="label" for="task-project">Project</label>
                    <select class="select" id="task-project" required>
                        <option value="">Select a project</option>
                        ${projectOptions}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="label" for="task-priority">Priority</label>
                    <select class="select" id="task-priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="label" for="task-due-date">Due Date</label>
                    <input type="date" class="input" id="task-due-date">
                </div>
                
                <button type="submit" class="btn btn-primary btn-full">Create Task</button>
            </form>
        `;
        
        ui.showModal('Create New Task', content);
    },
    
    // Handle create task
    handleCreateTask(event) {
        event.preventDefault();
        
        const taskData = {
            title: document.getElementById('task-title').value,
            description: document.getElementById('task-description').value,
            projectId: document.getElementById('task-project').value,
            priority: document.getElementById('task-priority').value,
            dueDate: document.getElementById('task-due-date').value
        };
        
        const task = tasks.create(taskData);
        if (task) {
            ui.closeModal();
            this.navigateTo(`tasks/${task.id}`);
        }
    },
    
    // Show user menu
    showUserMenu() {
        const user = storage.getCurrentUser();
        const items = [
            {
                label: 'Profile Settings',
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path><path d="M12 6v6l4 2"></path></svg>',
                handler: () => this.navigateTo('settings')
            },
            { divider: true },
            {
                label: 'Export Data',
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
                handler: () => this.exportData()
            },
            {
                label: 'Import Data',
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
                handler: () => this.importData()
            },
            { divider: true },
            {
                label: 'Logout',
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>',
                handler: () => auth.logout()
            }
        ];
        
        ui.createDropdown('#user-menu-trigger', items);
    },
    
    // Export data
    exportData() {
        const data = storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proker-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        utils.showToast('Data exported successfully!', 'success');
    },
    
    // Import data
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    if (storage.importData(event.target.result)) {
                        utils.showToast('Data imported successfully!', 'success');
                        window.location.reload();
                    } else {
                        utils.showToast('Failed to import data', 'destructive');
                    }
                } catch (error) {
                    utils.showToast('Invalid file format', 'destructive');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Initializing ProKer app...');
        app.init();
        console.log('ProKer app initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});