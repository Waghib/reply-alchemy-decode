
import { AuthModule } from './modules/auth.js';
import { UIModule } from './modules/ui.js';
import { UsageModule } from './modules/usage.js';
import { AnalysisModule } from './modules/analysis.js';

// Initialize managers
let authModule;
let uiModule;
let usageModule;
let analysisModule;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup loaded, initializing...');
  initializeManagers();
  await checkAuthStatus();
  setupEventListeners();
});

function initializeManagers() {
  authModule = new AuthModule();
  uiModule = new UIModule();
  usageModule = new UsageModule(authModule.supabase);
  analysisModule = new AnalysisModule(authModule.supabase);
  console.log('Managers initialized');
}

async function checkAuthStatus() {
  console.log('Checking initial auth status...');
  const authResult = await authModule.checkAuthStatus();
  
  if (authResult.authenticated) {
    console.log('User is authenticated, loading user data...');
    await loadUserData();
    uiModule.showMainSection();
  } else {
    console.log('User not authenticated, showing auth section');
    uiModule.showAuthSection();
    uiModule.updateAuthMode(authModule.isSignInMode);
    if (authResult.error) {
      uiModule.showError(authResult.error);
    }
  }
}

async function loadUserData() {
  try {
    console.log('Loading user data...');
    await authModule.checkSubscription();
    await usageModule.loadUserUsage(authModule.currentUser.id);
    uiModule.updateUserDisplay(
      authModule.currentUser.email, 
      authModule.subscribed,
      usageModule.freeUsageCount,
      usageModule.getRemainingFreeAnalyses()
    );
    console.log('User data loaded successfully');
  } catch (error) {
    console.error('Error loading user data:', error);
    uiModule.showError('Failed to load user data. Please try refreshing.');
  }
}

async function handleAuth(event) {
  event.preventDefault();
  console.log('Form submitted, handling auth...');
  
  const formData = uiModule.getFormData();
  const { email, password } = formData;
  const isSignUp = !authModule.isSignInMode;
  
  console.log('Auth attempt:', { email, isSignUp, passwordLength: password.length });
  
  // Validate inputs
  if (!email || !password) {
    uiModule.showError('Please enter both email and password.');
    return;
  }
  
  if (password.length < 6) {
    uiModule.showError('Password must be at least 6 characters long.');
    return;
  }
  
  uiModule.clearError();
  uiModule.setAuthSubmitState(true, isSignUp);
  
  try {
    let result;
    
    if (isSignUp) {
      result = await authModule.signUp(email, password);
    } else {
      result = await authModule.signIn(email, password);
    }
    
    if (result.success) {
      console.log('Authentication successful');
      
      if (result.needsConfirmation) {
        uiModule.showSuccess(result.message);
        uiModule.setAuthSubmitState(false, isSignUp);
        return;
      }
      
      // Clear form after successful auth
      uiModule.clearAuthForm();
      await loadUserData();
      uiModule.showMainSection();
      uiModule.showSuccess(`${isSignUp ? 'Account created' : 'Signed in'} successfully!`);
    }
    
  } catch (error) {
    console.error('Authentication failed:', error);
    uiModule.showError(error.message || 'Authentication failed. Please try again.');
  } finally {
    uiModule.setAuthSubmitState(false, isSignUp);
  }
}

function toggleAuthMode(event) {
  event.preventDefault();
  console.log('Auth toggle clicked');
  const isSignInMode = authModule.toggleAuthMode();
  uiModule.updateAuthMode(isSignInMode);
}

async function analyzeMessage() {
  const messageInput = document.getElementById('message-input');
  const message = messageInput.value.trim();
  
  if (!message) {
    uiModule.showError('Please enter a message to analyze');
    return;
  }
  
  if (!usageModule.canAnalyze(authModule.subscribed)) {
    uiModule.showError('You have reached your free analysis limit. Please upgrade to continue.');
    return;
  }
  
  const selectedTone = analysisModule.getSelectedTone();
  uiModule.setAnalyzeButtonState(true);
  
  try {
    const result = await analysisModule.analyzeMessage(message, selectedTone);
    uiModule.showResults(result.intent, result.suggestedReply);
    
    // Update usage count if not subscribed
    if (!authModule.subscribed) {
      await usageModule.updateFreeUsageCount(authModule.currentUser.id, authModule.subscribed);
      uiModule.updateUserDisplay(
        authModule.currentUser.email, 
        authModule.subscribed,
        usageModule.freeUsageCount,
        usageModule.getRemainingFreeAnalyses()
      );
    }
    
  } catch (error) {
    console.error('Analysis failed:', error);
    uiModule.showError('Analysis failed. Please try again.');
  } finally {
    uiModule.setAnalyzeButtonState(false);
  }
}

async function copyReply() {
  const success = await analysisModule.copyReply();
  if (success) {
    uiModule.updateCopyButtonState(true);
    setTimeout(() => {
      uiModule.updateCopyButtonState(false);
    }, 2000);
  }
}

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  // Authentication form - prevent default and handle properly
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', handleAuth);
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
      try {
        await authModule.signOut();
        usageModule.freeUsageCount = 0;
        uiModule.showAuthSection();
        uiModule.updateAuthMode(authModule.isSignInMode);
        uiModule.showSuccess('Signed out successfully');
      } catch (error) {
        console.error('Sign out failed:', error);
        uiModule.showError('Failed to sign out. Please try again.');
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
    newAnalysisBtn.addEventListener('click', () => uiModule.resetAnalysis());
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
setTimeout(() => {
  if (authModule) {
    authModule.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        authModule.currentUser = session.user;
        await loadUserData();
        uiModule.showMainSection();
      } else if (event === 'SIGNED_OUT') {
        authModule.currentUser = null;
        authModule.subscribed = false;
        usageModule.freeUsageCount = 0;
        uiModule.showAuthSection();
        uiModule.updateAuthMode(authModule.isSignInMode);
      }
    });
  }
}, 100);
