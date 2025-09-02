// Content script for The Unseen Spectrum Chrome Extension

class ContentScriptManager {
    constructor() {
        this.isEnabled = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSettings();
        this.initializeFeatures();
    }

    setupEventListeners() {
        // Listen for messages from popup and background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // DOM events
        document.addEventListener('DOMContentLoaded', () => {
            this.onDOMReady();
        });

        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            this.onVisibilityChange();
        });

        // Window events
        window.addEventListener('load', () => {
            this.onWindowLoad();
        });
    }

    async loadSettings() {
        try {
            const result = await chrome.storage.sync.get(['extensionEnabled']);
            this.isEnabled = result.extensionEnabled !== false; // Default to true
            this.updatePageState();
        } catch (error) {
            console.error('Error loading settings:', error);
            this.isEnabled = true; // Default fallback
        }
    }

    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'ping':
                    sendResponse({ success: true, message: 'Content script is active' });
                    break;

                case 'toggleFeature':
                    this.toggleFeature(message.enabled);
                    sendResponse({ success: true });
                    break;

                case 'getPageInfo':
                    sendResponse({ 
                        success: true, 
                        data: this.getPageInfo() 
                    });
                    break;

                case 'highlightElements':
                    this.highlightElements(message.selector);
                    sendResponse({ success: true });
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

    toggleFeature(enabled) {
        this.isEnabled = enabled;
        this.updatePageState();
        
        // Notify background script
        chrome.runtime.sendMessage({
            action: 'featureToggled',
            enabled: enabled,
            url: window.location.href
        });
    }

    updatePageState() {
        if (this.isEnabled) {
            this.enableFeatures();
        } else {
            this.disableFeatures();
        }
    }

    enableFeatures() {
        // Add extension-specific class to body
        document.body.classList.add('unseen-spectrum-enabled');
        
        // Add visual indicator
        this.addVisualIndicator();
        
        // Enable specific features
        this.enablePageAnalysis();
        this.enableKeyboardShortcuts();
    }

    disableFeatures() {
        // Remove extension-specific class
        document.body.classList.remove('unseen-spectrum-enabled');
        
        // Remove visual indicator
        this.removeVisualIndicator();
        
        // Disable specific features
        this.disablePageAnalysis();
        this.disableKeyboardShortcuts();
    }

    addVisualIndicator() {
        // Add a subtle indicator that the extension is active
        if (!document.getElementById('unseen-spectrum-indicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'unseen-spectrum-indicator';
            indicator.innerHTML = '🔍';
            indicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 10000;
                background: rgba(102, 126, 234, 0.9);
                color: white;
                padding: 8px;
                border-radius: 50%;
                font-size: 16px;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                transition: all 0.3s ease;
            `;
            
            indicator.addEventListener('click', () => {
                this.showExtensionInfo();
            });
            
            document.body.appendChild(indicator);
        }
    }

    removeVisualIndicator() {
        const indicator = document.getElementById('unseen-spectrum-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    enablePageAnalysis() {
        // Analyze page content
        this.analyzePageContent();
        
        // Monitor for dynamic content changes
        this.observePageChanges();
    }

    disablePageAnalysis() {
        // Stop observing changes
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    analyzePageContent() {
        // Example: Analyze page for specific patterns
        const links = document.querySelectorAll('a[href]');
        const images = document.querySelectorAll('img[src]');
        const forms = document.querySelectorAll('form');
        
        console.log(`Page analysis: ${links.length} links, ${images.length} images, ${forms.length} forms`);
        
        // You can add specific analysis logic here
        this.analyzeAccessibility();
        this.analyzePerformance();
    }

    analyzeAccessibility() {
        // Check for accessibility issues
        const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
        const linksWithoutText = document.querySelectorAll('a:not([aria-label]):not([title])');
        
        if (imagesWithoutAlt.length > 0) {
            console.log(`Found ${imagesWithoutAlt.length} images without alt text`);
        }
        
        if (linksWithoutText.length > 0) {
            console.log(`Found ${linksWithoutText.length} links without accessible text`);
        }
    }

    analyzePerformance() {
        // Basic performance analysis
        const largeImages = document.querySelectorAll('img[src]');
        largeImages.forEach(img => {
            if (img.naturalWidth > 1920 || img.naturalHeight > 1080) {
                console.log('Large image detected:', img.src);
            }
        });
    }

    observePageChanges() {
        // Watch for dynamic content changes
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    this.handleNewContent(mutation.addedNodes);
                }
            });
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    handleNewContent(nodes) {
        // Handle newly added content
        nodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Analyze new elements
                this.analyzeNewElement(node);
            }
        });
    }

    analyzeNewElement(element) {
        // Analyze newly added elements
        if (element.tagName === 'IMG' && !element.alt) {
            console.log('New image without alt text detected');
        }
    }

    enableKeyboardShortcuts() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    disableKeyboardShortcuts() {
        // Remove keyboard shortcuts
        document.removeEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Shift + U for extension toggle
        if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'U') {
            event.preventDefault();
            this.toggleFeature(!this.isEnabled);
        }
    }

    getPageInfo() {
        return {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
            timestamp: new Date().toISOString(),
            enabled: this.isEnabled
        };
    }

    highlightElements(selector) {
        // Highlight elements matching selector
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.outline = '2px solid #667eea';
            element.style.outlineOffset = '2px';
        });
        
        // Remove highlights after 3 seconds
        setTimeout(() => {
            elements.forEach(element => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        }, 3000);
    }

    showExtensionInfo() {
        // Show extension information
        const info = this.getPageInfo();
        alert(`The Unseen Spectrum Extension\n\nURL: ${info.url}\nTitle: ${info.title}\nStatus: ${info.enabled ? 'Enabled' : 'Disabled'}`);
    }

    onDOMReady() {
        console.log('Content script: DOM ready');
        this.updatePageState();
    }

    onVisibilityChange() {
        if (!document.hidden) {
            console.log('Content script: Page became visible');
            this.updatePageState();
        }
    }

    onWindowLoad() {
        console.log('Content script: Window loaded');
        this.analyzePageContent();
    }
}

// Initialize content script
const contentScript = new ContentScriptManager();
