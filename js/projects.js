// Project CRUD operations

const projects = {
    // Get all projects
    getAll() {
        return storage.getProjects();
    },
    
    // Get project by ID
    getById(id) {
        return storage.getProjectById(id);
    },
    
    // Create new project
    create(projectData) {
        const project = {
            id: utils.generateId(),
            name: projectData.name,
            description: projectData.description || '',
            status: projectData.status || 'planning',
            priority: projectData.priority || 'medium',
            progress: 0,
            owner: storage.getCurrentUser().id,
            team: projectData.team || [storage.getCurrentUser().id],
            startDate: projectData.startDate || new Date().toISOString(),
            deadline: projectData.deadline,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tasks: []
        };
        
        if (storage.addProject(project)) {
            utils.showToast('Project created successfully!', 'success');
            return project;
        }
        
        utils.showToast('Failed to create project', 'destructive');
        return null;
    },
    
    // Update project
    update(id, updates) {
        if (storage.updateProject(id, updates)) {
            utils.showToast('Project updated successfully!', 'success');
            return true;
        }
        
        utils.showToast('Failed to update project', 'destructive');
        return false;
    },
    
    // Delete project
    delete(id) {
        ui.showConfirm(
            'Delete Project',
            'Are you sure you want to delete this project? This action cannot be undone.',
            () => {
                // Delete associated tasks
                const project = this.getById(id);
                if (project && project.tasks) {
                    project.tasks.forEach(taskId => {
                        storage.deleteTask(taskId);
                    });
                }
                
                if (storage.deleteProject(id)) {
                    utils.showToast('Project deleted successfully!', 'success');
                    app.navigateTo('projects');
                } else {
                    utils.showToast('Failed to delete project', 'destructive');
                }
            }
        );
    },
    
    // Calculate project progress
    calculateProgress(projectId) {
        const project = this.getById(projectId);
        if (!project || !project.tasks || project.tasks.length === 0) {
            return 0;
        }
        
        const tasks = project.tasks.map(taskId => storage.getTaskById(taskId)).filter(Boolean);
        const completedTasks = tasks.filter(task => task.status === 'done').length;
        
        return Math.round((completedTasks / tasks.length) * 100);
    },
    
    // Update project progress
    updateProgress(projectId) {
        const progress = this.calculateProgress(projectId);
        this.update(projectId, { progress });
        return progress;
    },
    
    // Get project statistics
    getStatistics() {
        const projects = this.getAll();
        
        return {
            total: projects.length,
            active: projects.filter(p => p.status === 'active').length,
            planning: projects.filter(p => p.status === 'planning').length,
            onHold: projects.filter(p => p.status === 'on_hold').length,
            completed: projects.filter(p => p.status === 'completed').length,
            avgProgress: projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length || 0
        };
    },
    
    // Get recent projects
    getRecent(limit = 5) {
        return this.getAll()
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
    },
    
    // Get projects by status
    getByStatus(status) {
        return this.getAll().filter(p => p.status === status);
    },
    
    // Add team member to project
    addTeamMember(projectId, userId) {
        const project = this.getById(projectId);
        if (project && !project.team.includes(userId)) {
            project.team.push(userId);
            return this.update(projectId, { team: project.team });
        }
        return false;
    },
    
    // Remove team member from project
    removeTeamMember(projectId, userId) {
        const project = this.getById(projectId);
        if (project) {
            project.team = project.team.filter(id => id !== userId);
            return this.update(projectId, { team: project.team });
        }
        return false;
    },
    
    // Render project card
    renderProjectCard(project) {
        const statusBadgeClass = {
            'planning': 'badge-secondary',
            'active': 'badge-primary',
            'on_hold': 'badge-warning',
            'completed': 'badge-success'
        };
        
        const statusText = {
            'planning': 'Planning',
            'active': 'Active',
            'on_hold': 'On Hold',
            'completed': 'Completed'
        };
        
        return `
            <div class="project-card" onclick="app.navigateTo('projects/${project.id}')">
                <div class="project-header">
                    <div>
                        <h4 class="project-title">${project.name}</h4>
                        <p class="project-description">${project.description}</p>
                    </div>
                    <span class="badge ${statusBadgeClass[project.status]}">
                        ${statusText[project.status]}
                    </span>
                </div>
                
                <div class="project-progress">
                    <div class="project-progress-bar">
                        <div class="project-progress-fill" style="width: ${project.progress || 0}%;"></div>
                    </div>
                </div>
                
                <div class="project-footer">
                    <div class="project-team">
                        <div class="team-avatars">
                            ${this.renderTeamAvatars(project.team.slice(0, 3))}
                        </div>
                        ${project.team.length > 3 ? `<span class="team-count">+${project.team.length - 3} more</span>` : ''}
                    </div>
                    <span class="project-tasks">
                        ${project.tasks ? `${project.tasks.filter(id => {
                            const task = storage.getTaskById(id);
                            return task && task.status === 'done';
                        }).length}/${project.tasks.length} tasks` : '0 tasks'}
                    </span>
                </div>
            </div>
        `;
    },
    
    // Render team avatars
    renderTeamAvatars(teamIds) {
        const colors = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--info)'];
        
        return teamIds.map((id, index) => {
            // In a real app, fetch user data
            const initials = `U${id}`;
            const color = colors[index % colors.length];
            
            return `
                <div class="team-avatar" style="background-color: ${color};">
                    ${initials}
                </div>
            `;
        }).join('');
    },
    
    // Filter projects
    filter(filters) {
        let filtered = this.getAll();
        
        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }
        
        if (filters.priority) {
            filtered = filtered.filter(p => p.priority === filters.priority);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(search) ||
                p.description.toLowerCase().includes(search)
            );
        }
        
        if (filters.team) {
            filtered = filtered.filter(p => p.team.includes(filters.team));
        }
        
        return filtered;
    }
};