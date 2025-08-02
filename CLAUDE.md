# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ProKer is a mobile-first project management web application built with vanilla HTML, CSS, and JavaScript. It provides teams with project organization, task management, and collaboration features in a native app-like mobile web experience.

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (no frameworks)
**Primary Viewport:** 375px (mobile-first)
**Data Storage:** Local Storage API
**Design Language:** Orange accent (#FF8368), modern clean UI

## Project Structure

```
proker/
├── index.html                 # Main entry point, app shell
├── css/
│   ├── style.css             # Global styles, CSS reset, utilities
│   ├── components.css        # Reusable UI components
│   ├── screens.css           # Screen-specific styles
│   └── animations.css        # Transitions and animations
├── js/
│   ├── app.js               # Main application initialization
│   ├── router.js            # Client-side routing (hash-based)
│   ├── storage.js           # Local storage management
│   ├── auth.js              # Authentication logic
│   ├── projects.js          # Project CRUD operations
│   ├── tasks.js             # Task CRUD operations
│   ├── ui.js                # UI helpers and components
│   └── utils.js             # Utility functions
├── assets/
│   ├── icons/               # SVG icons
│   ├── images/              # Illustrations, avatars
│   └── fonts/               # Web fonts (if needed)
└── screens/                 # HTML templates/partials
    ├── onboarding.html
    ├── auth.html
    ├── dashboard.html
    ├── projects.html
    ├── tasks.html
    └── profile.html
```

## Key Development Commands

Since this is a vanilla JavaScript project with no build process:

```bash
# Serve locally with any static server
python -m http.server 8000
# or
npx serve .
# or use VS Code Live Server extension

# No build, lint, or test commands - vanilla HTML/CSS/JS
```

## Architecture & Core Concepts

### Client-Side Routing
- Hash-based routing system (#/dashboard, #/projects, #/tasks)
- Routes managed in `router.js` with screen transitions
- Route guards for authentication in `auth.js`

### State Management
- Global app state kept in memory (app.js)
- Synchronized with localStorage on changes
- Event-based UI updates (pub/sub pattern)

### Data Persistence
```javascript
// localStorage keys:
'proker_user'     // Current user object
'proker_projects' // Array of all projects
'proker_tasks'    // Array of all tasks  
'proker_settings' // App preferences
```

### Data Models

**User Schema:**
```javascript
{
  id: "unique_id",
  name: "User Name",
  email: "user@email.com",
  role: "admin|member",
  avatar: "avatar_url",
  createdAt: "timestamp",
  preferences: { theme: "light", notifications: true }
}
```

**Project Schema:**
```javascript
{
  id: "unique_id",
  name: "Project Name",
  description: "Project description",
  status: "planning|active|on_hold|completed",
  priority: "low|medium|high",
  progress: 0-100,
  owner: "user_id",
  team: ["user_id1", "user_id2"],
  startDate: "date",
  deadline: "date",
  tasks: ["task_id1", "task_id2"]
}
```

**Task Schema:**
```javascript
{
  id: "unique_id",
  projectId: "project_id",
  title: "Task Title",
  description: "Task description",
  status: "todo|in_progress|review|done",
  priority: "low|medium|high",
  assignee: "user_id",
  dueDate: "date",
  comments: []
}
```

### Navigation Structure
- Bottom tab bar navigation (5 tabs)
- Dashboard → Projects → Add (+) → Tasks → Profile
- Add button (center) opens context menu for new project/task

### Design System Variables
```css
/* Primary Colors */
--primary: #FF8368;
--primary-dark: #F44F46;
--primary-light: #FFB5A3;

/* Component Specs */
- Border Radius: 8px (small), 15px (medium), 20px (large), 40px (pill)
- Button Height: 48px (primary), 40px (secondary)
- Input Height: 48px
- Card Padding: 16px
- Safe Area: 24px margins
```

## Mobile-First Development Guidelines

1. **Touch Targets:** Minimum 48x48px for all interactive elements
2. **Gestures:** Implement swipe for navigation, pull-to-refresh
3. **Performance:** Keep animations at 60fps using CSS transforms
4. **Offline Support:** App should work fully offline after first load
5. **Viewport:** Lock viewport during transitions to prevent jank

## Key Implementation Patterns

### Screen Loading Pattern
```javascript
// In router.js
async function loadScreen(screenName) {
  // 1. Show loading state
  // 2. Fetch HTML template from screens/
  // 3. Parse and inject into DOM
  // 4. Initialize screen-specific JS
  // 5. Animate transition
}
```

### CRUD Operation Pattern
```javascript
// In projects.js or tasks.js
function createItem(data) {
  // 1. Validate input
  // 2. Generate unique ID
  // 3. Add to state
  // 4. Persist to localStorage
  // 5. Emit update event
  // 6. Update UI
}
```

### Event System Pattern
```javascript
// Event-based updates for reactive UI
eventBus.emit('project:created', projectData);
eventBus.on('project:created', updateProjectList);
```

## Current Development Status

The project is in planning phase with:
- ✅ Development plan created
- ✅ UI mockup designed (mockup.css, mockup.jpeg)
- ✅ Workflows documented
- ⏳ No code implementation yet

Next steps follow Phase 1 of development_plan.md:
1. Set up project structure and files
2. Implement CSS reset and design system
3. Create base HTML structure
4. Build reusable CSS components
5. Set up font loading
6. Implement animations

## Important Notes

- This is a **mobile-first** project - all features must work on 375px viewport
- **No external dependencies** - pure vanilla HTML/CSS/JS only
- **Offline-first** - all data stored locally, no backend API
- **Single-page application** using client-side routing
- Performance target: <3s load time, 60fps animations, <100ms interactions