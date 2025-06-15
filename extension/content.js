
// Main content script - now modular and focused
import { WidgetManager } from './modules/widgetManager.js';
import { TextSelectionManager } from './modules/textSelection.js';
import { APICommunication } from './modules/apiCommunication.js';
import { MessageAnalyzer } from './modules/messageAnalyzer.js';

// Content script for DM Decoder extension
let isActive = true;
let widgetManager = null;
let textSelectionManager = null;
let apiCommunication = null;
let messageAnalyzer = null;

// Initialize extension when content script loads
(function init() {
  console.log('DM Decoder extension loaded');
  
  // Initialize modules
  widgetManager = new WidgetManager();
  apiCommunication = new APICommunication();
  messageAnalyzer = new MessageAnalyzer(apiCommunication, widgetManager);
  textSelectionManager = new TextSelectionManager((text) => {
    messageAnalyzer.analyzeSelectedText(text);
  });
})();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'toggleExtension':
      toggleExtension(request.active);
      break;
    case 'analyzeText':
      messageAnalyzer.analyzeSelectedText(request.text);
      break;
  }
});

function toggleExtension(active) {
  isActive = active;
  if (!active) {
    widgetManager.hideWidget();
    textSelectionManager.hideQuickButton();
  }
}
