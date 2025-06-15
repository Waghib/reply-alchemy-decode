import { AuthManager } from './modules/auth.js';
import { UIManager } from './modules/ui.js';
import { UsageManager } from './modules/usage.js';
import { AnalysisManager } from './modules/analysis.js';

// Initialize managers
let authManager;
let uiManager;
let usageManager;
let analysisManager;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded, initializing...');
  initializeManagers();
  await checkAuthStatus();
  setupEventListeners();
});

function initializeManagers() {
  authManager = new AuthManager();
  uiManager = new UIManager();
  usageManager = new UsageManager(authManager.supabase);
  analysisManager = new AnalysisManager(authManager.supabase);
  console.log('Managers initialized');
}

async function checkAuthStatus() {
  console.log('Checking initial auth status...');
  const authResult = await authManager.checkAuthStatus();
  
  if (authResult.authenticated) {
    console.log('User is authenticated, loading user data...');
    await loadUserData();
    uiManager.showMainSection();
  } else {
    console.log('User not authenticated, showing auth section');
    uiManager.showAuthSection();
    if (authResult.error) {
      uiManager.showError(authResult.error);
    }
  }
}

async function loadUserData() {
  try {
    console.log('Loading user data...');
    await authManager.checkSubscription();
    await usageManager.loadUserUsage(authManager.currentUser.id);
    usageManager.updateUsageDisplay(authManager.currentUser.email, authManager.subscribed);
    console.log('User data loaded successfully');
  } catch (error) {
    console.error('Error loading user data:', error);
    uiManager.showError('Failed to load user data. Please try refreshing.');
  }
}

async function handleAuth(email, password, isSignUp = false) {
  console.log(`Handling ${isSignUp ? 'sign up' : 'sign in'} for:`, email);
  
  // Validate inputs
  if (!email || !password) {
    uiManager.showError('Please enter both email and password.');
    return;
  }
  
  if (password.length < 6) {
    uiManager.showError('Password must be at least 6 characters long.');
    return;
  }
  
  uiManager.clearError();
  uiManager.setAuthSubmitState(true, isSignUp);
  
  try {
    let result;
    
    if (isSignUp) {
      result = await authManager.signUp(email, password);
    } else {
      result = await authManager.signIn(email, password);
    }
    
    if (result.success) {
      console.log('Authentication successful');
      
      if (result.needsConfirmation) {
        uiManager.showSuccess(result.message);
        return;
      }
      
      // Clear form and load user data
      uiManager.clearAuthForm();
      await loadUserData();
      uiManager.showMainSection();
      uiManager.showSuccess(`${isSignUp ? 'Account created' : 'Signed in'} successfully!`);
    }
    
  } catch (error) {
    console.error('Authentication failed:', error);
    uiManager.showError(error.message || 'Authentication failed. Please try again.');
  } finally {
    uiManager.setAuthSubmitState(false, isSignUp);
  }
}

function toggleAuthMode() {
  const isSignInMode = authManager.toggleAuthMode();
  uiManager.updateAuthMode(isSignInMode);
}

async function analyzeMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  
  if (!message) {
    uiManager.showError('Please enter a message to analyze');
    return;
  }
  
  if (!usageManager.canAnalyze(authManager.subscribed)) {
    uiManager.showError('You have reached your free analysis limit. Please upgrade to continue.');
    return;
  }
  
  const selectedTone = analysisManager.getSelectedTone();
  uiManager.setAnalyzeButtonState(true);
  
  try {
    const result = await analysisManager.analyzeMessage(message, selectedTone);
    uiManager.showResults(result.intent, result.suggestedReply);
    
    // Update usage count if not subscribed
    if (!authManager.subscribed) {
      await usageManager.updateFreeUsageCount(authManager.currentUser.id, authManager.subscribed);
      usageManager.updateUsageDisplay(authManager.currentUser.email, authManager.subscribed);
    }
    
  } catch (error) {
    console.error('Analysis failed:', error);
    uiManager.showError('Analysis failed. Please try again.');
  } finally {
    uiManager.setAnalyzeButtonState(false);
  }
}

async function copyReply() {
  const success = await analysisManager.copyReply();
  if (success) {
    uiManager.updateCopyButtonState(true);
    setTimeout(() => {
      uiManager.updateCopyButtonState(false);
    }, 2000);
  }
}

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Authentication form
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Auth form submitted');
      
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      
      console.log('Form data:', { email, passwordLength: password.length });
      
      await handleAuth(email, password, !authManager.isSignInMode);
    });
  }
  
  // Auth mode toggle
  const authToggleBtn = document.getElementById('auth-toggle-btn');
  if (authToggleBtn) {
    authToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Auth toggle clicked');
      toggleAuthMode();
    });
  }
  
  // Sign out
  const signOutBtn = document.getElementById('sign-out-btn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      try {
        await authManager.signOut();
        usageManager.freeUsageCount = 0;
        uiManager.showAuthSection();
        uiManager.showSuccess('Signed out successfully');
      } catch (error) {
        console.error('Sign out failed:', error);
        uiManager.showError('Failed to sign out. Please try again.');
      }
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
    newAnalysisBtn.addEventListener('click', () => uiManager.resetAnalysis());
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

// Listen for auth state changes
if (authManager) {
  authManager.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    
    if (event === 'SIGNED_IN' && session?.user) {
      authManager.currentUser = session.user;
      await loadUserData();
      uiManager.showMainSection();
    } else if (event === 'SIGNED_OUT') {
      authManager.currentUser = null;
      authManager.subscribed = false;
      usageManager.freeUsageCount = 0;
      uiManager.showAuthSection();
    }
  });
}
