// Task CRUD operations

const tasks = {
    // Get all tasks
    getAll() {
        return storage.getTasks();
    },
    
    // Get task by ID
    getById(id) {
        return storage.getTaskById(id);
    },
    
    // Get tasks by project ID
    getByProjectId(projectId) {
        return storage.getTasksByProjectId(projectId);
    },
    
    // Create new task
    create(taskData) {
        const task = {
            id: utils.generateId(),
            projectId: taskData.projectId,
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status || 'todo',
            priority: taskData.priority || 'medium',
            assignee: taskData.assignee || storage.getCurrentUser().id,
            createdBy: storage.getCurrentUser().id,
            dueDate: taskData.dueDate,
            completedAt: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            comments: [],
            attachments: []
        };
        
        if (storage.addTask(task)) {
            // Add task to project
            if (task.projectId) {
                const project = projects.getById(task.projectId);
                if (project) {
                    project.tasks = project.tasks || [];
                    project.tasks.push(task.id);
                    projects.update(task.projectId, { tasks: project.tasks });
                    projects.updateProgress(task.projectId);
                }
            }
            
            utils.showToast('Task created successfully!', 'success');
            return task;
        }
        
        utils.showToast('Failed to create task', 'destructive');
        return null;
    },
    
    // Update task
    update(id, updates) {
        const oldTask = this.getById(id);
        
        if (storage.updateTask(id, updates)) {
            // If status changed to done, set completedAt
            if (updates.status === 'done' && oldTask.status !== 'done') {
                storage.updateTask(id, { completedAt: new Date().toISOString() });
            } else if (updates.status !== 'done' && oldTask.status === 'done') {
                storage.updateTask(id, { completedAt: null });
            }
            
            // Update project progress if task belongs to a project
            if (oldTask.projectId) {
                projects.updateProgress(oldTask.projectId);
            }
            
            utils.showToast('Task updated successfully!', 'success');
            return true;
        }
        
        utils.showToast('Failed to update task', 'destructive');
        return false;
    },
    
    // Delete task
    delete(id) {
        ui.showConfirm(
            'Delete Task',
            'Are you sure you want to delete this task? This action cannot be undone.',
            () => {
                const task = this.getById(id);
                
                if (storage.deleteTask(id)) {
                    // Remove task from project
                    if (task && task.projectId) {
                        const project = projects.getById(task.projectId);
                        if (project && project.tasks) {
                            project.tasks = project.tasks.filter(taskId => taskId !== id);
                            projects.update(task.projectId, { tasks: project.tasks });
                            projects.updateProgress(task.projectId);
                        }
                    }
                    
                    utils.showToast('Task deleted successfully!', 'success');
                    app.navigateTo('tasks');
                } else {
                    utils.showToast('Failed to delete task', 'destructive');
                }
            }
        );
    },
    
    // Toggle task completion
    toggleTask(id) {
        const task = this.getById(id);
        if (task) {
            const newStatus = task.status === 'done' ? 'todo' : 'done';
            this.update(id, { status: newStatus });
        }
    },
    
    // Get task statistics
    getStatistics() {
        const tasks = this.getAll();
        
        return {
            total: tasks.length,
            todo: tasks.filter(t => t.status === 'todo').length,
            inProgress: tasks.filter(t => t.status === 'in_progress').length,
            review: tasks.filter(t => t.status === 'review').length,
            done: tasks.filter(t => t.status === 'done').length,
            overdue: tasks.filter(t => {
                if (!t.dueDate || t.status === 'done') return false;
                return new Date(t.dueDate) < new Date();
            }).length
        };
    },
    
    // Get upcoming tasks
    getUpcoming(limit = 10) {
        const now = new Date();
        
        return this.getAll()
            .filter(t => t.status !== 'done' && t.dueDate)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, limit);
    },
    
    // Get overdue tasks
    getOverdue() {
        const now = new Date();
        
        return this.getAll()
            .filter(t => {
                if (!t.dueDate || t.status === 'done') return false;
                return new Date(t.dueDate) < now;
            })
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    },
    
    // Get tasks by assignee
    getByAssignee(userId) {
        return this.getAll().filter(t => t.assignee === userId);
    },
    
    // Add comment to task
    addComment(taskId, text) {
        const task = this.getById(taskId);
        if (task) {
            const comment = {
                id: utils.generateId(),
                userId: storage.getCurrentUser().id,
                text: text,
                createdAt: new Date().toISOString()
            };
            
            task.comments = task.comments || [];
            task.comments.push(comment);
            
            return this.update(taskId, { comments: task.comments });
        }
        return false;
    },
    
    // Render task item
    renderTaskItem(task, showProject = false) {
        const priorityClass = {
            'high': 'priority-high',
            'medium': 'priority-medium',
            'low': 'priority-low'
        };
        
        const priorityText = {
            'high': 'High Priority',
            'medium': 'Medium Priority',
            'low': 'Low Priority'
        };
        
        let dueText = '';
        if (task.dueDate) {
            const due = new Date(task.dueDate);
            const now = new Date();
            const diff = due - now;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days < 0) {
                dueText = `Overdue by ${Math.abs(days)} day${Math.abs(days) > 1 ? 's' : ''}`;
            } else if (days === 0) {
                dueText = 'Due Today';
            } else if (days === 1) {
                dueText = 'Due Tomorrow';
            } else {
                dueText = `Due in ${days} days`;
            }
        }
        
        const project = showProject && task.projectId ? projects.getById(task.projectId) : null;
        
        return `
            <div class="task-item">
                <input type="checkbox" 
                    class="task-checkbox" 
                    ${task.status === 'done' ? 'checked' : ''}
                    onchange="tasks.toggleTask('${task.id}')">
                <div class="task-content" onclick="app.navigateTo('tasks/${task.id}')">
                    <div class="task-title ${task.status === 'done' ? 'line-through opacity-50' : ''}">${task.title}</div>
                    <div class="task-meta">
                        <span class="task-priority">
                            <span class="priority-dot ${priorityClass[task.priority]}"></span>
                            ${priorityText[task.priority]}
                        </span>
                        ${dueText ? `<span>${dueText}</span>` : ''}
                        ${project ? `<span class="text-muted">${project.name}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Filter tasks
    filter(filters) {
        let filtered = this.getAll();
        
        if (filters.status) {
            filtered = filtered.filter(t => t.status === filters.status);
        }
        
        if (filters.priority) {
            filtered = filtered.filter(t => t.priority === filters.priority);
        }
        
        if (filters.projectId) {
            filtered = filtered.filter(t => t.projectId === filters.projectId);
        }
        
        if (filters.assignee) {
            filtered = filtered.filter(t => t.assignee === filters.assignee);
        }
        
        if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(search) ||
                t.description.toLowerCase().includes(search)
            );
        }
        
        if (filters.dueDate) {
            // Filter by due date range
            const { start, end } = filters.dueDate;
            filtered = filtered.filter(t => {
                if (!t.dueDate) return false;
                const due = new Date(t.dueDate);
                return due >= new Date(start) && due <= new Date(end);
            });
        }
        
        return filtered;
    },
    
    // Sort tasks
    sort(tasks, sortBy = 'dueDate', order = 'asc') {
        const sorted = [...tasks];
        
        sorted.sort((a, b) => {
            let aVal, bVal;
            
            switch (sortBy) {
                case 'dueDate':
                    aVal = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
                    bVal = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
                    break;
                case 'priority':
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    aVal = priorityOrder[a.priority];
                    bVal = priorityOrder[b.priority];
                    break;
                case 'status':
                    const statusOrder = { todo: 1, in_progress: 2, review: 3, done: 4 };
                    aVal = statusOrder[a.status];
                    bVal = statusOrder[b.status];
                    break;
                case 'title':
                    aVal = a.title.toLowerCase();
                    bVal = b.title.toLowerCase();
                    break;
                case 'createdAt':
                    aVal = new Date(a.createdAt);
                    bVal = new Date(b.createdAt);
                    break;
                default:
                    return 0;
            }
            
            if (order === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
        
        return sorted;
    }
};