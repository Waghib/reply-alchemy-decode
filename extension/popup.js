
// Popup script for DM Decoder extension with Supabase authentication
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.45.0';

// Same Supabase configuration as the web app
const SUPABASE_URL = "https://aodowsouzxzjuvroqule.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZG93c291enh6anV2cm9xdWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDA1MjQsImV4cCI6MjA2NTQ3NjUyNH0.Ez5lIB3pF2Hguyn5BgPKhUUbSwL977-edi-wgrHFca4";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    // Check current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session?.user) {
      currentUser = session.user;
      await loadUserData();
      showMainSection();
      console.log('User authenticated:', currentUser.email);
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
    let result;
    
    if (isSignUp) {
      result = await supabase.auth.signUp({
        email: email,
        password: password
      });
    } else {
      result = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
    }
    
    if (result.error) {
      if (!isSignUp && result.error.message.includes('Invalid login credentials')) {
        // Try sign up if sign in failed
        return await handleAuth(email, password, true);
      }
      throw result.error;
    }
    
    if (result.data.user) {
      currentUser = result.data.user;
      await loadUserData();
      showMainSection();
    }
    
  } catch (error) {
    console.error('Auth error:', error);
    showError(error.message || 'Authentication failed. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = isSignUp ? 'Create Account' : 'Sign In';
  }
}

async function loadUserData() {
  try {
    // Check subscription status
    const { data: subscription } = await supabase.functions.invoke('check-subscription');
    subscribed = subscription?.subscribed || false;
    
    // Load free usage count
    const { data: usage, error } = await supabase
      .from('free_usage_tracking')
      .select('usage_count')
      .eq('user_id', currentUser.id)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error loading usage:', error);
    }
    
    freeUsageCount = usage?.usage_count || 0;
    updateUsageDisplay();
    
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

async function updateFreeUsageCount() {
  if (!currentUser || subscribed) return true;
  
  try {
    const newCount = freeUsageCount + 1;
    
    const { error } = await supabase
      .from('free_usage_tracking')
      .upsert({
        user_id: currentUser.id,
        usage_count: newCount,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) {
      console.error('Error updating usage:', error);
      return false;
    }
    
    freeUsageCount = newCount;
    updateUsageDisplay();
    return true;
    
  } catch (error) {
    console.error('Error updating usage:', error);
    return false;
  }
}

function showError(message) {
  const errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.classList.remove('hidden');
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
  const authSection = document.getElementById('auth-section');
  const mainSection = document.getElementById('main-section');
  
  if (authSection) authSection.classList.remove('hidden');
  if (mainSection) mainSection.classList.add('hidden');
}

function showMainSection() {
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
      await supabase.auth.signOut();
      currentUser = null;
      subscribed = false;
      freeUsageCount = 0;
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
    // Use the same demo analysis function as the web app
    const { data, error } = await supabase.functions.invoke('generate-demo-reply', {
      body: { message, tone: selectedTone }
    });
    
    if (error) throw error;
    
    showResults(data.intent, data.suggestedReply);
    
    // Update usage count if not subscribed
    if (!subscribed) {
      await updateFreeUsageCount();
    }
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Fallback demo responses
    const demoResponses = {
      friendly: "Thanks for reaching out! I'd be happy to help with this. When would be a good time to discuss further?",
      formal: "Thank you for your inquiry. I would be pleased to assist you with this matter. Please let me know when we can schedule a discussion.",
      witty: "Well hello there! Looks like you've got something interesting brewing. I'm all ears! 👂"
    };
    
    showResults('Business Inquiry', demoResponses[selectedTone] || demoResponses.friendly);
    
    if (!subscribed) {
      await updateFreeUsageCount();
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

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event, session?.user?.email);
  
  if (event === 'SIGNED_IN' && session?.user) {
    currentUser = session.user;
    await loadUserData();
    showMainSection();
  } else if (event === 'SIGNED_OUT') {
    currentUser = null;
    subscribed = false;
    freeUsageCount = 0;
    showAuthSection();
  }
});
