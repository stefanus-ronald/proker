// UI Helper functions

const ui = {
    // Show modal
    showModal(title, content, actions = []) {
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        
        // Create modal content
        const modal = document.createElement('div');
        modal.className = 'modal-content card';
        modal.style.cssText = `
            width: 90%;
            max-width: 400px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        // Modal header
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: var(--space-4);
        `;
        header.innerHTML = `
            <h3 class="font-semibold">${title}</h3>
            <button class="btn btn-ghost btn-icon btn-sm" onclick="ui.closeModal()">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        // Modal body
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.style.cssText = `margin-bottom: var(--space-4);`;
        body.innerHTML = content;
        
        // Modal footer
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.style.cssText = `
            display: flex;
            gap: var(--space-2);
            justify-content: flex-end;
        `;
        
        // Add action buttons
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = `btn ${action.class || 'btn-secondary'}`;
            btn.textContent = action.label;
            btn.onclick = () => {
                if (action.handler) action.handler();
                if (action.closeModal !== false) ui.closeModal();
            };
            footer.appendChild(btn);
        });
        
        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(body);
        if (actions.length > 0) modal.appendChild(footer);
        backdrop.appendChild(modal);
        
        // Add to page
        document.body.appendChild(backdrop);
        
        // Close on backdrop click
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) ui.closeModal();
        });
        
        return backdrop;
    },
    
    // Close modal
    closeModal() {
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.style.opacity = '0';
            setTimeout(() => backdrop.remove(), 200);
        }
    },
    
    // Show confirm dialog
    showConfirm(title, message, onConfirm, onCancel) {
        this.showModal(title, `<p>${message}</p>`, [
            {
                label: 'Cancel',
                class: 'btn-outline',
                handler: onCancel
            },
            {
                label: 'Confirm',
                class: 'btn-primary',
                handler: onConfirm
            }
        ]);
    },
    
    // Show bottom sheet
    showBottomSheet(content, height = '50vh') {
        const sheet = document.createElement('div');
        sheet.className = 'bottom-sheet';
        sheet.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: var(--background);
            border-top-left-radius: var(--radius-xl);
            border-top-right-radius: var(--radius-xl);
            box-shadow: var(--shadow-xl);
            z-index: 999;
            max-height: ${height};
            overflow-y: auto;
            transform: translateY(100%);
            transition: transform var(--transition-base);
        `;
        
        // Sheet handle
        const handle = document.createElement('div');
        handle.style.cssText = `
            width: 40px;
            height: 4px;
            background-color: var(--border);
            border-radius: 2px;
            margin: var(--space-3) auto;
        `;
        
        // Sheet content
        const sheetContent = document.createElement('div');
        sheetContent.style.cssText = `
            padding: 0 var(--space-6) var(--space-6);
        `;
        sheetContent.innerHTML = content;
        
        sheet.appendChild(handle);
        sheet.appendChild(sheetContent);
        
        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'sheet-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 998;
            opacity: 0;
            transition: opacity var(--transition-base);
        `;
        
        document.body.appendChild(backdrop);
        document.body.appendChild(sheet);
        
        // Show with animation
        setTimeout(() => {
            backdrop.style.opacity = '1';
            sheet.style.transform = 'translateY(0)';
        }, 10);
        
        // Close handlers
        backdrop.addEventListener('click', () => ui.closeBottomSheet());
        
        // Swipe down to close
        let startY = 0;
        let currentY = 0;
        
        handle.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });
        
        handle.addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            if (diff > 0) {
                sheet.style.transform = `translateY(${diff}px)`;
            }
        });
        
        handle.addEventListener('touchend', () => {
            const diff = currentY - startY;
            if (diff > 50) {
                ui.closeBottomSheet();
            } else {
                sheet.style.transform = 'translateY(0)';
            }
        });
        
        return sheet;
    },
    
    // Close bottom sheet
    closeBottomSheet() {
        const sheet = document.querySelector('.bottom-sheet');
        const backdrop = document.querySelector('.sheet-backdrop');
        
        if (sheet && backdrop) {
            sheet.style.transform = 'translateY(100%)';
            backdrop.style.opacity = '0';
            
            setTimeout(() => {
                sheet.remove();
                backdrop.remove();
            }, 300);
        }
    },
    
    // Create dropdown menu
    createDropdown(trigger, items) {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: var(--space-2);
            background-color: var(--background);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            min-width: 200px;
            z-index: 100;
            display: none;
        `;
        
        items.forEach((item, index) => {
            if (item.divider) {
                const divider = document.createElement('div');
                divider.style.cssText = `
                    height: 1px;
                    background-color: var(--border);
                    margin: var(--space-2) 0;
                `;
                dropdown.appendChild(divider);
            } else {
                const menuItem = document.createElement('button');
                menuItem.className = 'dropdown-item';
                menuItem.style.cssText = `
                    display: flex;
                    align-items: center;
                    width: 100%;
                    padding: var(--space-3) var(--space-4);
                    border: none;
                    background: none;
                    color: var(--foreground);
                    font-size: var(--text-sm);
                    text-align: left;
                    cursor: pointer;
                    transition: background-color var(--transition-fast);
                `;
                
                menuItem.innerHTML = `
                    ${item.icon ? `<span style="margin-right: var(--space-3);">${item.icon}</span>` : ''}
                    <span>${item.label}</span>
                `;
                
                menuItem.addEventListener('click', () => {
                    if (item.handler) item.handler();
                    ui.closeDropdown();
                });
                
                menuItem.addEventListener('mouseenter', () => {
                    menuItem.style.backgroundColor = 'var(--muted)';
                });
                
                menuItem.addEventListener('mouseleave', () => {
                    menuItem.style.backgroundColor = 'transparent';
                });
                
                dropdown.appendChild(menuItem);
            }
        });
        
        // Position relative to trigger
        const triggerEl = typeof trigger === 'string' ? document.querySelector(trigger) : trigger;
        if (triggerEl) {
            triggerEl.style.position = 'relative';
            triggerEl.appendChild(dropdown);
            
            // Toggle on click
            triggerEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdown.style.display === 'block';
                ui.closeDropdown();
                if (!isOpen) {
                    dropdown.style.display = 'block';
                    dropdown.classList.add('dropdown-enter');
                }
            });
        }
        
        // Close on outside click
        document.addEventListener('click', ui.closeDropdown);
        
        return dropdown;
    },
    
    // Close dropdown
    closeDropdown() {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.style.display = 'none';
        });
    },
    
    // Create tabs
    createTabs(container, tabs, activeIndex = 0) {
        const tabContainer = document.createElement('div');
        tabContainer.className = 'tabs';
        
        // Tab headers
        const tabHeaders = document.createElement('div');
        tabHeaders.className = 'tab-headers';
        tabHeaders.style.cssText = `
            display: flex;
            border-bottom: 1px solid var(--border);
            margin-bottom: var(--space-4);
        `;
        
        // Tab contents
        const tabContents = document.createElement('div');
        tabContents.className = 'tab-contents';
        
        tabs.forEach((tab, index) => {
            // Create header
            const header = document.createElement('button');
            header.className = `tab-header ${index === activeIndex ? 'active' : ''}`;
            header.style.cssText = `
                padding: var(--space-3) var(--space-4);
                border: none;
                background: none;
                color: ${index === activeIndex ? 'var(--primary)' : 'var(--muted-foreground)'};
                font-weight: var(--font-medium);
                font-size: var(--text-sm);
                cursor: pointer;
                position: relative;
                transition: color var(--transition-fast);
            `;
            header.textContent = tab.label;
            
            // Active indicator
            if (index === activeIndex) {
                const indicator = document.createElement('div');
                indicator.style.cssText = `
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background-color: var(--primary);
                `;
                header.appendChild(indicator);
            }
            
            // Click handler
            header.addEventListener('click', () => {
                ui.setActiveTab(tabContainer, index);
            });
            
            tabHeaders.appendChild(header);
            
            // Create content
            const content = document.createElement('div');
            content.className = `tab-content ${index === activeIndex ? 'active' : ''}`;
            content.style.display = index === activeIndex ? 'block' : 'none';
            content.innerHTML = tab.content;
            
            tabContents.appendChild(content);
        });
        
        tabContainer.appendChild(tabHeaders);
        tabContainer.appendChild(tabContents);
        
        if (container) {
            container.appendChild(tabContainer);
        }
        
        return tabContainer;
    },
    
    // Set active tab
    setActiveTab(tabContainer, index) {
        const headers = tabContainer.querySelectorAll('.tab-header');
        const contents = tabContainer.querySelectorAll('.tab-content');
        
        headers.forEach((header, i) => {
            if (i === index) {
                header.classList.add('active');
                header.style.color = 'var(--primary)';
                
                // Add indicator
                let indicator = header.querySelector('div');
                if (!indicator) {
                    indicator = document.createElement('div');
                    indicator.style.cssText = `
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        right: 0;
                        height: 2px;
                        background-color: var(--primary);
                    `;
                    header.appendChild(indicator);
                }
            } else {
                header.classList.remove('active');
                header.style.color = 'var(--muted-foreground)';
                const indicator = header.querySelector('div');
                if (indicator) indicator.remove();
            }
        });
        
        contents.forEach((content, i) => {
            if (i === index) {
                content.classList.add('active');
                content.style.display = 'block';
                content.classList.add('tab-content-enter');
            } else {
                content.classList.remove('active');
                content.style.display = 'none';
            }
        });
    },
    
    // Create progress stepper
    createStepper(steps, currentStep = 0) {
        const stepper = document.createElement('div');
        stepper.className = 'stepper';
        stepper.style.cssText = `
            display: flex;
            align-items: center;
            margin-bottom: var(--space-6);
        `;
        
        steps.forEach((step, index) => {
            // Step circle
            const circle = document.createElement('div');
            circle.style.cssText = `
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: var(--text-sm);
                font-weight: var(--font-medium);
                transition: all var(--transition-base);
                ${index <= currentStep 
                    ? 'background-color: var(--primary); color: var(--primary-foreground);' 
                    : 'background-color: var(--muted); color: var(--muted-foreground);'}
            `;
            circle.textContent = index + 1;
            
            // Step label
            const label = document.createElement('div');
            label.style.cssText = `
                font-size: var(--text-xs);
                color: ${index <= currentStep ? 'var(--foreground)' : 'var(--muted-foreground)'};
                margin-top: var(--space-2);
                text-align: center;
            `;
            label.textContent = step;
            
            // Step container
            const stepContainer = document.createElement('div');
            stepContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
            `;
            stepContainer.appendChild(circle);
            stepContainer.appendChild(label);
            
            stepper.appendChild(stepContainer);
            
            // Connector line
            if (index < steps.length - 1) {
                const line = document.createElement('div');
                line.style.cssText = `
                    flex: 1;
                    height: 2px;
                    margin: 0 var(--space-2);
                    transition: background-color var(--transition-base);
                    ${index < currentStep 
                        ? 'background-color: var(--primary);' 
                        : 'background-color: var(--border);'}
                `;
                stepper.appendChild(line);
            }
        });
        
        return stepper;
    }
};