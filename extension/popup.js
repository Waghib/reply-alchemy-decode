
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
  initializeManagers();
  await checkAuthStatus();
  setupEventListeners();
});

function initializeManagers() {
  authManager = new AuthManager();
  uiManager = new UIManager();
  usageManager = new UsageManager(authManager.supabase);
  analysisManager = new AnalysisManager(authManager.supabase);
}

async function checkAuthStatus() {
  const authResult = await authManager.checkAuthStatus();
  
  if (authResult.authenticated) {
    await loadUserData();
    uiManager.showMainSection();
  } else {
    uiManager.showAuthSection();
  }
}

async function loadUserData() {
  try {
    await authManager.checkSubscription();
    await usageManager.loadUserUsage(authManager.currentUser.id);
    usageManager.updateUsageDisplay(authManager.currentUser.email, authManager.subscribed);
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

async function handleAuth(email, password, isSignUp = false) {
  uiManager.clearError();
  uiManager.setAuthSubmitState(true, isSignUp);
  
  try {
    const result = await authManager.handleAuth(email, password, isSignUp);
    
    if (result.success) {
      await loadUserData();
      uiManager.showMainSection();
    }
    
  } catch (error) {
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
    alert('Please enter a message to analyze');
    return;
  }
  
  if (!usageManager.canAnalyze(authManager.subscribed)) {
    alert('You have reached your free analysis limit. Please upgrade to continue.');
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
  // Authentication form
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await handleAuth(email, password, !authManager.isSignInMode);
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
      await authManager.signOut();
      usageManager.freeUsageCount = 0;
      uiManager.showAuthSection();
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
