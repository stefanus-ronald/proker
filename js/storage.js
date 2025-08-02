// Local Storage Management

const storage = {
    // Storage keys
    keys: {
        USER: 'proker_user',
        PROJECTS: 'proker_projects',
        TASKS: 'proker_tasks',
        SETTINGS: 'proker_settings',
        SESSION: 'proker_session'
    },
    
    // Initialize storage with default data
    init() {
        // Check if storage is already initialized
        if (!this.get(this.keys.PROJECTS)) {
            this.set(this.keys.PROJECTS, this.getDefaultProjects());
        }
        
        if (!this.get(this.keys.TASKS)) {
            this.set(this.keys.TASKS, this.getDefaultTasks());
        }
        
        if (!this.get(this.keys.SETTINGS)) {
            this.set(this.keys.SETTINGS, this.getDefaultSettings());
        }
    },
    
    // Get item from storage
    get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
        }
    },
    
    // Set item in storage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting item in storage:', error);
            return false;
        }
    },
    
    // Remove item from storage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing item from storage:', error);
            return false;
        }
    },
    
    // Clear all storage
    clear() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    },
    
    // Get default projects
    getDefaultProjects() {
        return [
            {
                id: '1',
                name: 'Mobile App Redesign',
                description: 'Redesigning the user interface for better UX',
                status: 'active',
                priority: 'high',
                progress: 65,
                owner: '1',
                team: ['1', '2', '3', '4', '5'],
                startDate: '2024-01-15',
                deadline: '2024-03-30',
                createdAt: '2024-01-15',
                updatedAt: '2024-02-01',
                tasks: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
            },
            {
                id: '2',
                name: 'Website Development',
                description: 'Building new company website with CMS',
                status: 'active',
                priority: 'high',
                progress: 85,
                owner: '1',
                team: ['1', '2'],
                startDate: '2024-01-01',
                deadline: '2024-02-28',
                createdAt: '2024-01-01',
                updatedAt: '2024-02-01',
                tasks: ['13', '14', '15', '16', '17', '18']
            },
            {
                id: '3',
                name: 'Marketing Campaign',
                description: 'Q1 2024 social media marketing campaign',
                status: 'planning',
                priority: 'medium',
                progress: 20,
                owner: '1',
                team: ['1', '3', '4'],
                startDate: '2024-02-01',
                deadline: '2024-04-30',
                createdAt: '2024-01-20',
                updatedAt: '2024-01-25',
                tasks: []
            }
        ];
    },
    
    // Get default tasks
    getDefaultTasks() {
        return [
            {
                id: '1',
                projectId: '1',
                title: 'Complete wireframes for homepage',
                description: 'Create detailed wireframes for the new homepage design',
                status: 'todo',
                priority: 'high',
                assignee: '1',
                createdBy: '1',
                dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
                completedAt: null,
                createdAt: '2024-01-15',
                updatedAt: '2024-01-15',
                comments: [],
                attachments: []
            },
            {
                id: '2',
                projectId: '1',
                title: 'Review API documentation',
                description: 'Review and update API documentation for v2.0',
                status: 'in_progress',
                priority: 'medium',
                assignee: '2',
                createdBy: '1',
                dueDate: new Date(Date.now() + 172800000).toISOString(), // 2 days
                completedAt: null,
                createdAt: '2024-01-16',
                updatedAt: '2024-01-20',
                comments: [],
                attachments: []
            },
            {
                id: '3',
                projectId: '1',
                title: 'Client presentation preparation',
                description: 'Prepare slides and demo for client presentation',
                status: 'todo',
                priority: 'high',
                assignee: '1',
                createdBy: '1',
                dueDate: new Date(Date.now() + 259200000).toISOString(), // 3 days
                completedAt: null,
                createdAt: '2024-01-17',
                updatedAt: '2024-01-17',
                comments: [],
                attachments: []
            }
        ];
    },
    
    // Get default settings
    getDefaultSettings() {
        return {
            theme: 'light',
            notifications: true,
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    },
    
    // Get current user
    getCurrentUser() {
        return this.get(this.keys.USER);
    },
    
    // Set current user
    setCurrentUser(user) {
        return this.set(this.keys.USER, user);
    },
    
    // Get all projects
    getProjects() {
        return this.get(this.keys.PROJECTS) || [];
    },
    
    // Get project by ID
    getProjectById(id) {
        const projects = this.getProjects();
        return projects.find(p => p.id === id);
    },
    
    // Add project
    addProject(project) {
        const projects = this.getProjects();
        projects.push(project);
        return this.set(this.keys.PROJECTS, projects);
    },
    
    // Update project
    updateProject(id, updates) {
        const projects = this.getProjects();
        const index = projects.findIndex(p => p.id === id);
        
        if (index !== -1) {
            projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set(this.keys.PROJECTS, projects);
        }
        
        return false;
    },
    
    // Delete project
    deleteProject(id) {
        const projects = this.getProjects().filter(p => p.id !== id);
        return this.set(this.keys.PROJECTS, projects);
    },
    
    // Get all tasks
    getTasks() {
        return this.get(this.keys.TASKS) || [];
    },
    
    // Get task by ID
    getTaskById(id) {
        const tasks = this.getTasks();
        return tasks.find(t => t.id === id);
    },
    
    // Get tasks by project ID
    getTasksByProjectId(projectId) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.projectId === projectId);
    },
    
    // Add task
    addTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        return this.set(this.keys.TASKS, tasks);
    },
    
    // Update task
    updateTask(id, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
            return this.set(this.keys.TASKS, tasks);
        }
        
        return false;
    },
    
    // Delete task
    deleteTask(id) {
        const tasks = this.getTasks().filter(t => t.id !== id);
        return this.set(this.keys.TASKS, tasks);
    },
    
    // Get settings
    getSettings() {
        return this.get(this.keys.SETTINGS) || this.getDefaultSettings();
    },
    
    // Update settings
    updateSettings(updates) {
        const settings = this.getSettings();
        return this.set(this.keys.SETTINGS, { ...settings, ...updates });
    },
    
    // Get storage size
    getStorageSize() {
        let total = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        
        return (total / 1024).toFixed(2) + ' KB';
    },
    
    // Export data
    exportData() {
        const data = {
            user: this.getCurrentUser(),
            projects: this.getProjects(),
            tasks: this.getTasks(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    },
    
    // Import data
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.user) this.setCurrentUser(data.user);
            if (data.projects) this.set(this.keys.PROJECTS, data.projects);
            if (data.tasks) this.set(this.keys.TASKS, data.tasks);
            if (data.settings) this.set(this.keys.SETTINGS, data.settings);
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }
};