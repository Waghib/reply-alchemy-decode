
// Popup script for DM Decoder extension with built-in authentication
let currentUser = null;
let freeUsageCount = 0;
let subscribed = false;
let isSignInMode = true;

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuthStatus();
  setupEventListeners();
});

async function checkAuthStatus() {
  console.log('Checking auth status...');
  
  try {
    // Check if user data is stored locally
    const stored = await new Promise(resolve => {
      chrome.storage.local.get(['currentUser', 'userToken'], resolve);
    });
    
    if (stored.currentUser && stored.userToken) {
      currentUser = stored.currentUser;
      subscribed = stored.currentUser.subscribed || false;
      await loadUsageData();
      showMainSection();
      console.log('User authenticated from storage:', currentUser);
    } else {
      console.log('User not authenticated');
      showAuthSection();
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    showAuthSection();
  }
}

async function handleAuth(email, password, isSignUp = false) {
  const errorEl = document.getElementById('error-message');
  const submitBtn = document.getElementById('auth-submit');
  
  // Clear previous errors
  errorEl.classList.add('hidden');
  submitBtn.disabled = true;
  submitBtn.textContent = isSignUp ? 'Creating Account...' : 'Signing In...';
  
  try {
    const response = await fetch('https://aodowsouzxzjuvroqule.supabase.co/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZG93c291enh6anV2cm9xdWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDA1MjQsImV4cCI6MjA2NTQ3NjUyNH0.Ez5lIB3pF2Hguyn5BgPKhUUbSwL977-edi-wgrHFca4'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    if (response.ok) {
      const authData = await response.json();
      
      // Store user data
      currentUser = {
        id: authData.user.id,
        email: authData.user.email,
        subscribed: false // Default to false, can be updated later
      };
      
      // Store in chrome storage
      await new Promise(resolve => {
        chrome.storage.local.set({
          currentUser: currentUser,
          userToken: authData.access_token
        }, resolve);
      });
      
      await loadUsageData();
      showMainSection();
      
    } else {
      // If sign in failed and this was a sign in attempt, try sign up
      if (!isSignUp) {
        return await handleSignUp(email, password);
      } else {
        throw new Error('Authentication failed');
      }
    }
    
  } catch (error) {
    console.error('Auth error:', error);
    
    if (!isSignUp) {
      // Try sign up if sign in failed
      return await handleSignUp(email, password);
    }
    
    showError('Authentication failed. Please check your credentials and try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
  }
}

async function handleSignUp(email, password) {
  try {
    const response = await fetch('https://aodowsouzxzjuvroqule.supabase.co/auth/v1/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZG93c291enh6anV2cm9xdWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDA1MjQsImV4cCI6MjA2NTQ3NjUyNH0.Ez5lIB3pF2Hguyn5BgPKhUUbSwL977-edi-wgrHFca4'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    if (response.ok) {
      const authData = await response.json();
      
      // Store user data
      currentUser = {
        id: authData.user.id,
        email: authData.user.email,
        subscribed: false
      };
      
      // Store in chrome storage
      await new Promise(resolve => {
        chrome.storage.local.set({
          currentUser: currentUser,
          userToken: authData.access_token
        }, resolve);
      });
      
      await loadUsageData();
      showMainSection();
      
    } else {
      throw new Error('Account creation failed');
    }
    
  } catch (error) {
    console.error('Sign up error:', error);
    showError('Failed to create account. Please try again.');
  }
}

function showError(message) {
  const errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
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
  const userEmailEl = document.getElementById('user-email');
  
  if (dailyCountEl) dailyCountEl.textContent = freeUsageCount;
  if (remainingCountEl) remainingCountEl.textContent = subscribed ? '∞' : Math.max(0, 3 - freeUsageCount);
  if (userEmailEl && currentUser) userEmailEl.textContent = currentUser.email;
  
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

function toggleAuthMode() {
  isSignInMode = !isSignInMode;
  const titleEl = document.getElementById('auth-title');
  const submitBtn = document.getElementById('auth-submit');
  const toggleBtn = document.getElementById('auth-toggle-btn');
  const errorEl = document.getElementById('error-message');
  
  // Clear any errors
  errorEl.classList.add('hidden');
  
  if (isSignInMode) {
    titleEl.textContent = 'Sign In to DM Decoder';
    submitBtn.textContent = 'Sign In';
    toggleBtn.textContent = "Don't have an account? Sign up";
  } else {
    titleEl.textContent = 'Create DM Decoder Account';
    submitBtn.textContent = 'Create Account';
    toggleBtn.textContent = 'Already have an account? Sign in';
  }
}

function setupEventListeners() {
  // Authentication form
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await handleAuth(email, password, !isSignInMode);
    });
  }
  
  // Auth mode toggle
  const authToggleBtn = document.getElementById('auth-toggle-btn');
  if (authToggleBtn) {
    authToggleBtn.addEventListener('click', toggleAuthMode);
  }
  
  // Sign out
  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
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
    // Use demo analysis for now (can be upgraded to full API later)
    const demoResponses = {
      friendly: "Thanks for reaching out! I'd be happy to help with this. When would be a good time to discuss further?",
      formal: "Thank you for your inquiry. I would be pleased to assist you with this matter. Please let me know when we can schedule a discussion.",
      witty: "Well hello there! Looks like you've got something interesting brewing. I'm all ears! 👂"
    };
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const intent = 'Business Inquiry';
    const reply = demoResponses[selectedTone] || demoResponses.friendly;
    
    showResults(intent, reply);
    
    // Increment usage count
    if (!subscribed) {
      freeUsageCount++;
      updateUsageData();
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    alert('Analysis failed. Please try again.');
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
