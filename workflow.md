# ProKer App Workflows - Simplified

## Overview
ProKer uses a simple, consistent workflow pattern across all features. This document outlines the 4 core user flows that cover 90% of all interactions.

## 1. Authentication Flow

```mermaid
flowchart TD
    A[App Start] --> B{Logged In?}
    B -->|No| C[Login/Register]
    B -->|Yes| D[Dashboard]
    
    C --> E{Valid?}
    E -->|No| F[Show Error]
    F --> C
    E -->|Yes| D
```

## 2. Item Management Flow (Projects & Tasks)

Single pattern for all CRUD operations:

```mermaid
flowchart TD
    A[Item List] --> B{Action}
    
    B -->|View| C[Item Details]
    B -->|Create| D[New Item Form]
    B -->|Filter| E[Filtered List]
    
    C --> F{Edit/Delete?}
    F -->|Edit| G[Edit Form]
    F -->|Delete| H[Confirm Delete]
    
    D --> I{Valid?}
    I -->|No| J[Show Errors]
    J --> D
    I -->|Yes| K[Save & Return]
    
    G --> L{Save?}
    L -->|Yes| K
    L -->|No| C
    
    H -->|Yes| M[Delete & Return]
    H -->|No| C
    
    K --> A
    M --> A
```

## 3. Status Management Flow

Simple 3-state transitions:

```mermaid
flowchart LR
    subgraph Tasks
        A[Todo] --> B[In Progress]
        B --> C[Done]
    end
    
    subgraph Projects
        D[Active] --> E[Paused]
        E --> D
        D --> F[Complete]
        E --> F
    end
```

## 4. Navigation Flow

```mermaid
flowchart TD
    A[Bottom Navigation] --> B[Dashboard]
    A --> C[Projects]
    A --> D[+ Add]
    A --> E[Tasks]
    A --> F[Profile]
    
    D --> G{Quick Add}
    G --> H[New Project]
    G --> I[New Task]
    
    B --> J[Summary Cards]
    B --> K[Recent Items]
    
    C --> L[Project List]
    L --> M[Project Detail]
    M --> N[Project Tasks]
    
    E --> O[Task List]
    O --> P[Task Detail]
    
    F --> Q[Settings]
    F --> R[Logout]
    
    style D fill:#FF8368,color:#fff
```

## User Journey - Simplified

```mermaid
journey
    title Daily Workflow
    section Start
      Login: 5: User
      View Dashboard: 5: User
    section Work
      Check Tasks: 5: User
      Update Status: 5: User
      Create New Items: 4: User
    section End
      Review Progress: 4: User
      Logout: 5: User
```

## Core Principles

1. **Consistency**: Same pattern for all items (projects, tasks)
2. **Simplicity**: Maximum 3 states per entity
3. **Clarity**: Each screen has one primary purpose
4. **Efficiency**: Most actions complete in 2-3 taps

## Primary Actions (80% of usage)

- View lists and items
- Create new items
- Update item status
- Basic edits

## Secondary Actions (20% of usage)

- Delete items
- Advanced filters
- Bulk operations
- Settings changes

## Error Handling Pattern

All errors follow the same simple pattern:

1. Validate input
2. Show inline error if invalid
3. Allow retry
4. Show success confirmation when complete

## Data States

Each list can be in one of three states:

- **Loading**: Show spinner
- **Empty**: Show helpful message with action button
- **Data**: Show list with items

That's it! The entire app workflow in under 150 lines.