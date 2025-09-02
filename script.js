// Popup script for The Unseen Spectrum Chrome Extension
class PopupManager {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Color blindness simulation buttons
        document.getElementById('protanopia').addEventListener('click', () => {
            this.applyColorBlindnessSimulation('protanopia');
        });

        document.getElementById('deuteranopia').addEventListener('click', () => {
            this.applyColorBlindnessSimulation('deuteranopia');
        });

        document.getElementById('tritanopia').addEventListener('click', () => {
            this.applyColorBlindnessSimulation('tritanopia');
        });

        document.getElementById('achromatopsia').addEventListener('click', () => {
            this.applyColorBlindnessSimulation('achromatopsia');
        });

        // Reset button
        document.getElementById('reset').addEventListener('click', () => {
            this.resetSimulation();
        });

        // Settings button
        document.getElementById('openSettings').addEventListener('click', () => {
            this.openSettings();
        });
    }

    applyColorBlindnessSimulation(deficiency) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];

            if (activeTab) {
                console.log('Applying color blindness simulation:', deficiency, 'to tab:', activeTab.id);
                
                // First inject the color blindness simulation script
                chrome.scripting.executeScript({
                    target: { tabId: activeTab.id },
                    files: ['color-blind-simulation.js']
                }).then(() => {
                    console.log('Color blindness script injected successfully');
                    
                    // Then execute the simulation function
                    chrome.scripting.executeScript({
                        target: { tabId: activeTab.id },
                        function: simulateColorAsPerColorBlindness,
                        args: [deficiency]
                    });
                }).then(() => {
                    console.log('Color blindness simulation applied successfully');
                    this.showNotification(`${deficiency} simulation applied`, 'success');
                }).catch((error) => {
                    console.error('Error applying color blindness simulation:', error);
                    this.showNotification('Error applying color blindness simulation', 'error');
                });
            }
        });

        function simulateColorAsPerColorBlindness(deficiency) {
            console.log('Simulating color blindness:', deficiency);
            
            // Check if the colorBlindnessSimulation function is available
            if (typeof window.colorBlindnessSimulation !== 'function') {
                console.error('colorBlindnessSimulation function not found');
                return;
            }
            
            const elements = document.querySelectorAll('html, body, main, header, code, footer, input, textarea, p, h1, h2, h3, h4, h5, h6, span, a, div, table, tspan, tbody, thead, td, th, tr, tfoot, caption, details, summary, dl, dt, dd, ul, ol, li');
            console.log('Found', elements.length, 'elements to process');
            
            elements.forEach((el, index) => {
                try {
                    window.colorBlindnessSimulation(el, deficiency);
                } catch (error) {
                    console.error('Error processing element', index, ':', error);
                }
            });
            
            console.log('Color blindness simulation completed');
        }
    }

    resetSimulation() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                // First inject the color blindness simulation script if not already injected
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    files: ['color-blind-simulation.js']
                }).then(() => {
                    // Then execute the restore function
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        function: resetColors
                    });
                }).then(() => {
                    this.showNotification('Color simulation reset', 'success');
                }).catch((error) => {
                    console.error('Error resetting colors:', error);
                    this.showNotification('Error resetting colors', 'error');
                });
            }
        });

        function resetColors() {
            if (window.restoreOriginalColors) {
                window.restoreOriginalColors();
            } else {
                console.error('restoreOriginalColors function not available');
            }
        }
    }

    openSettings() {
        // Open Chrome extension settings page
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

// Cleanup when popup is closed
window.addEventListener('beforeunload', () => {
    cleanupColorSimulation();
});

// Also cleanup when the popup loses focus (alternative cleanup trigger)
window.addEventListener('blur', () => {
    // Small delay to avoid cleanup if user is just switching between popup elements
    setTimeout(() => {
        if (!document.hasFocus()) {
            cleanupColorSimulation();
        }
    }, 100);
});

function cleanupColorSimulation() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab) {
            console.log('Cleaning up color simulation on popup close');
            chrome.scripting.executeScript({
                target: { tabId: activeTab.id },
                function: restoreColors
            }).catch((error) => {
                console.error('Error during cleanup:', error);
            });
        }
    });

    function restoreColors() {
        if (window.restoreOriginalColors) {
            window.restoreOriginalColors();
        }
    }
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateStatus') {
        const popupManager = new PopupManager();
        popupManager.updateStatus();
    }
});
