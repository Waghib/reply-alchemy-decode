
// Popup script for DM Decoder extension
let currentUser = null;
let freeUsageCount = 0;
let subscribed = false;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
  setupEventListeners();
});

async function checkAuthStatus() {
  console.log('Starting auth check...');
  
  try {
    // Try multiple methods to check authentication
    const authResult = await tryMultipleAuthMethods();
    
    if (authResult && authResult.authenticated) {
      currentUser = authResult.user;
      subscribed = authResult.subscribed || false;
      await loadUsageData();
      showMainSection();
      console.log('User authenticated:', currentUser);
    } else {
      console.log('User not authenticated');
      showAuthSection();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    showAuthSection();
  }
}

async function tryMultipleAuthMethods() {
  console.log('Trying multiple auth methods...');
  
  // Method 1: Direct API call with credentials
  try {
    console.log('Trying direct API call...');
    const response = await fetch('https://reply-mind.lovable.app/api/auth/check', {
      credentials: 'include',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Direct API response:', data);
      if (data.authenticated) {
        return data;
      }
    }
  } catch (error) {
    console.log('Direct API method failed:', error);
  }
  
  // Method 2: Iframe communication
  try {
    console.log('Trying iframe method...');
    const iframeResult = await checkAuthViaIframe();
    if (iframeResult) {
      return iframeResult;
    }
  } catch (error) {
    console.log('Iframe method failed:', error);
  }
  
  // Method 3: Check if user is on dashboard page
  try {
    console.log('Trying dashboard check...');
    const dashboardResult = await checkIfOnDashboard();
    if (dashboardResult) {
      return dashboardResult;
    }
  } catch (error) {
    console.log('Dashboard check failed:', error);
  }
  
  return null;
}

async function checkAuthViaIframe() {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://reply-mind.lovable.app/dashboard';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const timeout = setTimeout(() => {
      cleanup();
      resolve(null);
    }, 8000);
    
    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('message', messageHandler);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };
    
    const messageHandler = async (event) => {
      if (event.origin !== 'https://reply-mind.lovable.app') return;
      
      console.log('Received iframe message:', event.data);
      
      if (event.data.type === 'EXTENSION_API_RESPONSE') {
        cleanup();
        
        if (event.data.success && event.data.data.authenticated) {
          resolve(event.data.data);
        } else {
          resolve(null);
        }
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    iframe.onload = () => {
      console.log('Iframe loaded, sending auth check request...');
      setTimeout(() => {
        iframe.contentWindow.postMessage({
          type: 'EXTENSION_API_REQUEST',
          path: '/api/auth/check',
          method: 'GET'
        }, 'https://reply-mind.lovable.app');
      }, 2000);
    };
    
    iframe.onerror = () => {
      cleanup();
      resolve(null);
    };
  });
}

async function checkIfOnDashboard() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.url && activeTab.url.includes('reply-mind.lovable.app')) {
        // User is on our website, likely authenticated
        resolve({
          authenticated: true,
          user: { email: 'user@example.com' }, // Placeholder
          subscribed: false
        });
      } else {
        resolve(null);
      }
    });
  });
}

async function loadUsageData() {
  try {
    const today = new Date().toDateString();
    const stored = await new Promise(resolve => {
      chrome.storage.local.get(['dailyCount', 'lastUsageDate'], resolve);
    });
    
    if (stored.lastUsageDate === today) {
      freeUsageCount = stored.dailyCount || 0;
    } else {
      freeUsageCount = 0;
    }
    
    updateUsageDisplay();
  } catch (error) {
    console.error('Error loading usage data:', error);
  }
}

function updateUsageData() {
  const today = new Date().toDateString();
  chrome.storage.local.set({
    dailyCount: freeUsageCount,
    lastUsageDate: today
  });
  updateUsageDisplay();
}

function updateUsageDisplay() {
  const dailyCountEl = document.getElementById('daily-count');
  const remainingCountEl = document.getElementById('remaining-count');
  
  if (dailyCountEl) dailyCountEl.textContent = freeUsageCount;
  if (remainingCountEl) remainingCountEl.textContent = subscribed ? '∞' : Math.max(0, 3 - freeUsageCount);
  
  // Show upgrade notice if free limit reached
  const upgradeNotice = document.getElementById('upgrade-notice');
  const analyzeBtn = document.getElementById('analyze-btn');
  
  if (!subscribed && freeUsageCount >= 3) {
    if (upgradeNotice) upgradeNotice.classList.remove('hidden');
    if (analyzeBtn) analyzeBtn.disabled = true;
  } else {
    if (upgradeNotice) upgradeNotice.classList.add('hidden');
    if (analyzeBtn) analyzeBtn.disabled = false;
  }
}

function showAuthSection() {
  console.log('Showing auth section');
  const authSection = document.getElementById('auth-section');
  const mainSection = document.getElementById('main-section');
  
  if (authSection) authSection.classList.remove('hidden');
  if (mainSection) mainSection.classList.add('hidden');
}

function showMainSection() {
  console.log('Showing main section');
  const authSection = document.getElementById('auth-section');
  const mainSection = document.getElementById('main-section');
  
  if (authSection) authSection.classList.add('hidden');
  if (mainSection) mainSection.classList.remove('hidden');
  updateUsageDisplay();
}

function setupEventListeners() {
  // Authentication
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://reply-mind.lovable.app' });
      // Check auth status after a delay to allow for login
      setTimeout(() => {
        checkAuthStatus();
      }, 3000);
    });
  }
  
  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        // Call web app logout endpoint
        await fetch('https://reply-mind.lovable.app/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.log('Logout error:', error);
      }
      
      // Clear local data
      currentUser = null;
      subscribed = false;
      freeUsageCount = 0;
      chrome.storage.local.clear();
      showAuthSection();
    });
  }
  
  // Tone selection
  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  
  // Analysis
  const analyzeBtn = document.getElementById('analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', analyzeMessage);
  }
  
  // Copy button
  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyReply);
  }
  
  // New analysis
  const newAnalysisBtn = document.getElementById('new-analysis-btn');
  if (newAnalysisBtn) {
    newAnalysisBtn.addEventListener('click', resetAnalysis);
  }
  
  // Open full app
  const openAppBtn = document.getElementById('open-app');
  if (openAppBtn) {
    openAppBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://reply-mind.lovable.app' });
      window.close();
    });
  }
  
  // Upgrade button
  const upgradeBtn = document.getElementById('upgrade-btn');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://reply-mind.lovable.app/dashboard' });
      window.close();
    });
  }
}

async function analyzeMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  
  if (!message) {
    alert('Please enter a message to analyze');
    return;
  }
  
  if (!subscribed && freeUsageCount >= 3) {
    alert('You have reached your free analysis limit. Please upgrade to continue.');
    return;
  }
  
  const selectedToneBtn = document.querySelector('.tone-btn.active');
  const selectedTone = selectedToneBtn ? selectedToneBtn.dataset.tone : 'friendly';
  const analyzeBtn = document.getElementById('analyze-btn');
  
  if (analyzeBtn) {
    analyzeBtn.textContent = 'Analyzing...';
    analyzeBtn.disabled = true;
  }
  
  try {
    let intent, reply;
    
    if (subscribed) {
      // Use full AI analysis for subscribed users
      const response = await fetch('https://reply-mind.lovable.app/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: message,
          tone: selectedTone
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        intent = result.intent;
        reply = result.suggestedReply;
      } else {
        throw new Error('Analysis failed');
      }
    } else {
      // Use demo analysis for free users
      const response = await fetch('https://reply-mind.lovable.app/api/demo-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          tone: selectedTone
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        intent = result.intent;
        reply = result.suggestedReply;
        
        // Increment free usage count
        freeUsageCount++;
        updateUsageData();
      } else {
        throw new Error('Demo analysis failed');
      }
    }
    
    showResults(intent, reply);
    
  } catch (error) {
    console.error('Analysis error:', error);
    // Fallback demo response
    const demoResponses = {
      friendly: "Thanks for reaching out! I'd be happy to help with this. When would be a good time to discuss further?",
      formal: "Thank you for your inquiry. I would be pleased to assist you with this matter. Please let me know when we can schedule a discussion.",
      witty: "Well hello there! Looks like you've got something interesting brewing. I'm all ears! 👂"
    };
    
    showResults('Business Inquiry', demoResponses[selectedTone] || demoResponses.friendly);
    
    if (!subscribed) {
      freeUsageCount++;
      updateUsageData();
    }
  } finally {
    if (analyzeBtn) {
      analyzeBtn.textContent = 'Analyze Message';
      analyzeBtn.disabled = false;
    }
  }
}

function showResults(intent, reply) {
  const intentResult = document.getElementById('intent-result');
  const replyResult = document.getElementById('reply-result');
  const resultsSection = document.getElementById('results-section');
  
  if (intentResult) intentResult.textContent = intent;
  if (replyResult) replyResult.textContent = reply;
  if (resultsSection) {
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function copyReply() {
  const replyResult = document.getElementById('reply-result');
  const replyText = replyResult ? replyResult.textContent : '';
  
  navigator.clipboard.writeText(replyText).then(() => {
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = originalText;
      }, 2000);
    }
  });
}

function resetAnalysis() {
  const messageInput = document.getElementById('message-input');
  const resultsSection = document.getElementById('results-section');
  
  if (messageInput) {
    messageInput.value = '';
    messageInput.focus();
  }
  if (resultsSection) {
    resultsSection.classList.add('hidden');
  }
}

// Listen for storage changes to update usage count
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.dailyCount) {
    freeUsageCount = changes.dailyCount.newValue || 0;
    updateUsageDisplay();
  }
});

// Check auth status when window becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    setTimeout(() => {
      checkAuthStatus();
    }, 1000);
  }
});

// Also check auth status when the popup window gets focus
window.addEventListener('focus', () => {
  setTimeout(() => {
    checkAuthStatus();
  }, 1000);
});

// Check auth status periodically when popup is open
setInterval(() => {
  if (!document.hidden) {
    checkAuthStatus();
  }
}, 5000);
