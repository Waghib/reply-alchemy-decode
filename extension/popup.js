// Popup script for DM Decoder extension
let currentUser = null;
let freeUsageCount = 0;
let subscribed = false;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
  setupEventListeners();
});

async function checkAuthStatus() {
  try {
    // First try to check via direct web app API
    const response = await fetch('https://reply-mind.lovable.app/api/auth/check', {
      credentials: 'include',
      mode: 'cors'
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.authenticated) {
        currentUser = data.user;
        subscribed = data.subscribed || false;
        await loadUsageData();
        showMainSection();
        return;
      }
    }
  } catch (error) {
    console.log('Direct API check failed, trying iframe method...');
  }
  
  // Fallback: Try to check via iframe communication
  try {
    await checkAuthViaIframe();
  } catch (error) {
    console.log('Iframe auth check failed:', error);
    showAuthSection();
  }
}

async function checkAuthViaIframe() {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://reply-mind.lovable.app';
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Auth check timeout'));
    }, 5000);
    
    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('message', messageHandler);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    };
    
    const messageHandler = async (event) => {
      if (event.origin !== 'https://reply-mind.lovable.app') return;
      
      if (event.data.type === 'EXTENSION_API_RESPONSE' && event.data.success) {
        cleanup();
        
        if (event.data.data.authenticated) {
          currentUser = event.data.data.user;
          subscribed = event.data.data.subscribed || false;
          await loadUsageData();
          showMainSection();
          resolve();
        } else {
          showAuthSection();
          resolve();
        }
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    iframe.onload = () => {
      iframe.contentWindow.postMessage({
        type: 'EXTENSION_API_REQUEST',
        path: '/api/auth/check',
        method: 'GET'
      }, 'https://reply-mind.lovable.app');
    };
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
  document.getElementById('daily-count').textContent = freeUsageCount;
  document.getElementById('remaining-count').textContent = subscribed ? '∞' : Math.max(0, 3 - freeUsageCount);
  
  // Show upgrade notice if free limit reached
  if (!subscribed && freeUsageCount >= 3) {
    document.getElementById('upgrade-notice').classList.remove('hidden');
    document.getElementById('analyze-btn').disabled = true;
  } else {
    document.getElementById('upgrade-notice').classList.add('hidden');
    document.getElementById('analyze-btn').disabled = false;
  }
}

function showAuthSection() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('main-section').classList.add('hidden');
}

function showMainSection() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('main-section').classList.remove('hidden');
  updateUsageDisplay();
}

function setupEventListeners() {
  // Authentication
  document.getElementById('login-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://reply-mind.lovable.app' });
    // Check auth status after a delay to allow for login
    setTimeout(() => {
      checkAuthStatus();
    }, 2000);
  });
  
  document.getElementById('sign-out-btn').addEventListener('click', async () => {
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
  
  // Tone selection
  document.querySelectorAll('.tone-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  
  // Analysis
  document.getElementById('analyze-btn').addEventListener('click', analyzeMessage);
  
  // Copy button
  document.getElementById('copy-btn').addEventListener('click', copyReply);
  
  // New analysis
  document.getElementById('new-analysis-btn').addEventListener('click', resetAnalysis);
  
  // Open full app
  document.getElementById('open-app').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://reply-mind.lovable.app' });
    window.close();
  });
  
  // Upgrade button
  document.getElementById('upgrade-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://reply-mind.lovable.app/dashboard' });
    window.close();
  });
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
  
  const selectedTone = document.querySelector('.tone-btn.active').dataset.tone;
  const analyzeBtn = document.getElementById('analyze-btn');
  
  analyzeBtn.textContent = 'Analyzing...';
  analyzeBtn.disabled = true;
  
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
    analyzeBtn.textContent = 'Analyze Message';
    analyzeBtn.disabled = false;
  }
}

function showResults(intent, reply) {
  document.getElementById('intent-result').textContent = intent;
  document.getElementById('reply-result').textContent = reply;
  document.getElementById('results-section').classList.remove('hidden');
  
  // Scroll to results
  document.getElementById('results-section').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copyReply() {
  const replyText = document.getElementById('reply-result').textContent;
  navigator.clipboard.writeText(replyText).then(() => {
    const copyBtn = document.getElementById('copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = originalText;
    }, 2000);
  });
}

function resetAnalysis() {
  document.getElementById('message-input').value = '';
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('message-input').focus();
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
    checkAuthStatus();
  }
});

// Also check auth status when the popup window gets focus
window.addEventListener('focus', () => {
  checkAuthStatus();
});

// Check auth status periodically when popup is open
setInterval(() => {
  if (!document.hidden) {
    checkAuthStatus();
  }
}, 3000);
