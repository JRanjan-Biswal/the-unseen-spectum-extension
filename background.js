// Background script for The Unseen Spectrum Chrome Extension

class BackgroundManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeExtension();
    }

    setupEventListeners() {
        // Extension installation/update
        chrome.runtime.onInstalled.addListener((details) => {
            this.handleInstallation(details);
        });

        // Tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            this.handleTabUpdate(tabId, changeInfo, tab);
        });

        // Tab activation
        chrome.tabs.onActivated.addListener((activeInfo) => {
            this.handleTabActivation(activeInfo);
        });

        // Messages from popup and content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Context menu (optional)
        chrome.contextMenus.onClicked.addListener((info, tab) => {
            this.handleContextMenuClick(info, tab);
        });
    }

    async handleInstallation(details) {
        console.log('Extension installed/updated:', details.reason);
        
        if (details.reason === 'install') {
            // Set default settings
            await chrome.storage.sync.set({
                extensionEnabled: true,
                lastUsed: new Date().toISOString(),
                installDate: new Date().toISOString()
            });

            // Create context menu
            this.createContextMenu();

            // Show welcome notification
            this.showNotification('The Unseen Spectrum extension installed successfully!');
        } else if (details.reason === 'update') {
            // Handle updates
            console.log('Extension updated to version:', chrome.runtime.getManifest().version);
        }
    }

    createContextMenu() {
        chrome.contextMenus.create({
            id: 'unseen-spectrum-action',
            title: 'Unseen Spectrum Action',
            contexts: ['page', 'selection']
        });
    }

    handleTabUpdate(tabId, changeInfo, tab) {
        // Only process when page is completely loaded
        if (changeInfo.status === 'complete' && tab.url) {
            this.processTab(tab);
        }
    }

    handleTabActivation(activeInfo) {
        // Handle when user switches to a different tab
        chrome.tabs.get(activeInfo.tabId, (tab) => {
            if (tab) {
                this.processTab(tab);
            }
        });
    }

    async processTab(tab) {
        try {
            // Check if extension is enabled
            const result = await chrome.storage.sync.get(['extensionEnabled']);
            
            if (result.extensionEnabled && this.isValidUrl(tab.url)) {
                // Inject content script if needed
                await this.ensureContentScript(tab.id);
            }
        } catch (error) {
            console.error('Error processing tab:', error);
        }
    }

    isValidUrl(url) {
        // Check if URL is valid for extension processing
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    async ensureContentScript(tabId) {
        try {
            // Check if content script is already injected
            await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        } catch (error) {
            // Content script not found, inject it
            try {
                await chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ['content.js']
                });
            } catch (injectError) {
                console.error('Error injecting content script:', injectError);
            }
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'getSettings':
                    const settings = await chrome.storage.sync.get();
                    sendResponse({ success: true, data: settings });
                    break;

                case 'updateSettings':
                    await chrome.storage.sync.set(message.data);
                    sendResponse({ success: true });
                    break;

                case 'showNotification':
                    this.showNotification(message.text, message.type);
                    sendResponse({ success: true });
                    break;

                case 'getTabInfo':
                    const tab = await chrome.tabs.get(sender.tab.id);
                    sendResponse({ success: true, data: tab });
                    break;

                default:
                    console.log('Unknown message action:', message.action);
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    handleContextMenuClick(info, tab) {
        // Handle context menu clicks
        console.log('Context menu clicked:', info, tab);
        
        // You can add specific actions here
        if (info.menuItemId === 'unseen-spectrum-action') {
            this.performContextAction(info, tab);
        }
    }

    async performContextAction(info, tab) {
        try {
            // Perform action based on context
            if (info.selectionText) {
                // Handle selected text
                console.log('Selected text:', info.selectionText);
            } else {
                // Handle page action
                console.log('Page action on:', tab.url);
            }
        } catch (error) {
            console.error('Error performing context action:', error);
        }
    }

    showNotification(text, type = 'basic') {
        // Show browser notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'The Unseen Spectrum',
            message: text
        });
    }

    async initializeExtension() {
        // Initialize extension state
        try {
            const result = await chrome.storage.sync.get(['extensionEnabled']);
            
            if (result.extensionEnabled === undefined) {
                // Set default state
                await chrome.storage.sync.set({ extensionEnabled: true });
            }
        } catch (error) {
            console.error('Error initializing extension:', error);
        }
    }
}

// Initialize background manager
new BackgroundManager();
