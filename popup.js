// Popup script for The Unseen Spectrum Chrome Extension

class PopupManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSettings();
        this.updateStatus();
    }

    bindEvents() {
        // Toggle feature button
        document.getElementById('toggleFeature').addEventListener('click', () => {
            this.toggleFeature();
        });

        // Settings button
        document.getElementById('openSettings').addEventListener('click', () => {
            this.openSettings();
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['extensionEnabled', 'lastUsed']);
            
            // Update UI based on stored settings
            if (result.extensionEnabled !== undefined) {
                this.updateFeatureStatus(result.extensionEnabled);
            }
            
            if (result.lastUsed) {
                this.updateLastUsed(result.lastUsed);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    async toggleFeature() {
        try {
            // Get current state
            const result = await chrome.storage.sync.get(['extensionEnabled']);
            const newState = !result.extensionEnabled;
            
            // Save new state
            await chrome.storage.sync.set({ 
                extensionEnabled: newState,
                lastUsed: new Date().toISOString()
            });
            
            // Update UI
            this.updateFeatureStatus(newState);
            
            // Send message to content script
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'toggleFeature',
                    enabled: newState
                });
            }
            
            // Show feedback
            this.showNotification(newState ? 'Feature enabled' : 'Feature disabled');
            
        } catch (error) {
            console.error('Error toggling feature:', error);
            this.showNotification('Error occurred', 'error');
        }
    }

    updateFeatureStatus(enabled) {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');
        const toggleBtn = document.getElementById('toggleFeature');
        
        if (enabled) {
            statusText.textContent = 'Active';
            statusDot.className = 'status-dot active';
            toggleBtn.innerHTML = '<span class="btn-icon">✅</span>Disable Feature';
        } else {
            statusText.textContent = 'Inactive';
            statusDot.className = 'status-dot inactive';
            toggleBtn.innerHTML = '<span class="btn-icon">🔍</span>Enable Feature';
        }
    }

    updateLastUsed(timestamp) {
        const lastUsed = new Date(timestamp);
        const timeAgo = this.getTimeAgo(lastUsed);
        
        // You could add a last used indicator to the UI here
        console.log(`Last used: ${timeAgo}`);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }

    updateStatus() {
        // Check if extension is working properly
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                const statusText = document.getElementById('statusText');
                statusText.textContent = 'Ready';
            }
        });
    }

    openSettings() {
        // Open options page or show settings modal
        chrome.runtime.openOptionsPage();
    }

    showNotification(message, type = 'success') {
        // Create a temporary notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: ${type === 'error' ? '#dc3545' : '#28a745'};
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupManager();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateStatus') {
        const popupManager = new PopupManager();
        popupManager.updateStatus();
    }
});
