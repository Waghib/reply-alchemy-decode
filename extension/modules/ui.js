
export class UIManager {
  constructor() {
    this.elements = this.getElements();
  }

  getElements() {
    return {
      authSection: document.getElementById('auth-section'),
      mainSection: document.getElementById('main-section'),
      authTitle: document.getElementById('auth-title'),
      authSubmit: document.getElementById('auth-submit'),
      authToggleBtn: document.getElementById('auth-toggle-btn'),
      errorMessage: document.getElementById('error-message'),
      userEmail: document.getElementById('user-email'),
      dailyCount: document.getElementById('daily-count'),
      remainingCount: document.getElementById('remaining-count'),
      upgradeNotice: document.getElementById('upgrade-notice'),
      analyzeBtn: document.getElementById('analyze-btn'),
      messageInput: document.getElementById('message-input'),
      resultsSection: document.getElementById('results-section'),
      intentResult: document.getElementById('intent-result'),
      replyResult: document.getElementById('reply-result'),
      copyBtn: document.getElementById('copy-btn'),
      emailInput: document.getElementById('email'),
      passwordInput: document.getElementById('password')
    };
  }

  showError(message) {
    console.log('Showing error:', message);
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.classList.remove('hidden');
      
      // Auto-hide error after 10 seconds
      setTimeout(() => {
        this.clearError();
      }, 10000);
    }
  }

  showSuccess(message) {
    console.log('Showing success:', message);
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.classList.remove('hidden');
      this.elements.errorMessage.style.backgroundColor = '#d1fae5';
      this.elements.errorMessage.style.borderColor = '#10b981';
      this.elements.errorMessage.style.color = '#065f46';
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        this.clearError();
      }, 5000);
    }
  }

  clearError() {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.classList.add('hidden');
      this.elements.errorMessage.style.backgroundColor = '';
      this.elements.errorMessage.style.borderColor = '';
      this.elements.errorMessage.style.color = '';
    }
  }

  showAuthSection() {
    if (this.elements.authSection) this.elements.authSection.classList.remove('hidden');
    if (this.elements.mainSection) this.elements.mainSection.classList.add('hidden');
  }

  showMainSection() {
    if (this.elements.authSection) this.elements.authSection.classList.add('hidden');
    if (this.elements.mainSection) this.elements.mainSection.classList.remove('hidden');
  }

  updateAuthMode(isSignInMode) {
    this.clearError();
    
    if (isSignInMode) {
      if (this.elements.authTitle) this.elements.authTitle.textContent = 'Sign In to DM Decoder';
      if (this.elements.authSubmit) this.elements.authSubmit.textContent = 'Sign In';
      if (this.elements.authToggleBtn) this.elements.authToggleBtn.textContent = "Don't have an account? Sign up";
    } else {
      if (this.elements.authTitle) this.elements.authTitle.textContent = 'Create DM Decoder Account';
      if (this.elements.authSubmit) this.elements.authSubmit.textContent = 'Create Account';
      if (this.elements.authToggleBtn) this.elements.authToggleBtn.textContent = 'Already have an account? Sign in';
    }
  }

  setAuthSubmitState(loading, isSignUp = false) {
    if (this.elements.authSubmit) {
      this.elements.authSubmit.disabled = loading;
      
      if (loading) {
        this.elements.authSubmit.textContent = isSignUp ? 'Creating Account...' : 'Signing In...';
        this.elements.authSubmit.style.opacity = '0.6';
      } else {
        this.elements.authSubmit.textContent = isSignUp ? 'Create Account' : 'Sign In';
        this.elements.authSubmit.style.opacity = '1';
      }
    }
    
    // Disable form inputs during loading
    if (this.elements.emailInput) this.elements.emailInput.disabled = loading;
    if (this.elements.passwordInput) this.elements.passwordInput.disabled = loading;
    if (this.elements.authToggleBtn) this.elements.authToggleBtn.disabled = loading;
  }

  clearAuthForm() {
    if (this.elements.emailInput) this.elements.emailInput.value = '';
    if (this.elements.passwordInput) this.elements.passwordInput.value = '';
  }

  setAnalyzeButtonState(loading) {
    if (this.elements.analyzeBtn) {
      this.elements.analyzeBtn.textContent = loading ? 'Analyzing...' : 'Analyze Message';
      this.elements.analyzeBtn.disabled = loading;
    }
  }

  showResults(intent, reply) {
    if (this.elements.intentResult) this.elements.intentResult.textContent = intent;
    if (this.elements.replyResult) this.elements.replyResult.textContent = reply;
    if (this.elements.resultsSection) {
      this.elements.resultsSection.classList.remove('hidden');
      this.elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  resetAnalysis() {
    if (this.elements.messageInput) {
      this.elements.messageInput.value = '';
      this.elements.messageInput.focus();
    }
    if (this.elements.resultsSection) {
      this.elements.resultsSection.classList.add('hidden');
    }
  }

  updateCopyButtonState(copied) {
    if (this.elements.copyBtn) {
      const originalText = this.elements.copyBtn.textContent;
      this.elements.copyBtn.textContent = copied ? 'Copied!' : originalText;
    }
  }
}
