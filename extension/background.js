
// Background service worker for DM Decoder extension
let isExtensionActive = false;

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyze-message",
    title: "Analyze with DM Decoder",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyze-message" && info.selectionText) {
    // Send selected text to content script for analysis
    chrome.tabs.sendMessage(tab.id, {
      action: "analyzeText",
      text: info.selectionText
    });
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    chrome.storage.sync.get(['apiKey', 'preferredTone'], (result) => {
      sendResponse(result);
    });
    return true;
  }
  
  if (request.action === "saveSettings") {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle extension icon click to toggle active state
chrome.action.onClicked.addListener((tab) => {
  isExtensionActive = !isExtensionActive;
  
  // Update icon based on state
  const iconPath = isExtensionActive ? "icons/icon32.png" : "icons/icon32-disabled.png";
  chrome.action.setIcon({ path: iconPath });
  
  // Send state to content script
  chrome.tabs.sendMessage(tab.id, {
    action: "toggleExtension",
    active: isExtensionActive
  });
});
