
// Popup script for DM Decoder extension
document.addEventListener('DOMContentLoaded', async () => {
  // Load settings
  await loadSettings();
  
  // Setup event listeners
  setupEventListeners();
  
  // Update status
  updateStatus();
});

async function loadSettings() {
  const settings = await new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'getSettings' }, resolve);
  });
  
  if (settings.preferredTone) {
    document.getElementById('default-tone').value = settings.preferredTone;
  }
}

function setupEventListeners() {
  // Open full app button
  document.getElementById('open-app').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://reply-mind.lovable.app' });
    window.close();
  });
  
  // Toggle extension button
  document.getElementById('toggle-extension').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const toggleBtn = document.getElementById('toggle-extension');
    
    if (toggleBtn.textContent === 'Disable Extension') {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleExtension', active: false });
      toggleBtn.textContent = 'Enable Extension';
      document.getElementById('extension-status').textContent = 'Disabled';
    } else {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleExtension', active: true });
      toggleBtn.textContent = 'Disable Extension';
      document.getElementById('extension-status').textContent = 'Active';
    }
  });
  
  // Default tone selector
  document.getElementById('default-tone').addEventListener('change', (e) => {
    chrome.runtime.sendMessage({
      action: 'saveSettings',
      settings: { preferredTone: e.target.value }
    });
  });
}

function updateStatus() {
  // Get daily usage count from storage
  chrome.storage.local.get(['dailyCount', 'lastUsageDate'], (result) => {
    const today = new Date().toDateString();
    let count = 0;
    
    if (result.lastUsageDate === today) {
      count = result.dailyCount || 0;
    }
    
    document.getElementById('daily-count').textContent = count;
  });
}

// Update daily count when popup is opened
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.dailyCount) {
    document.getElementById('daily-count').textContent = changes.dailyCount.newValue || 0;
  }
});
