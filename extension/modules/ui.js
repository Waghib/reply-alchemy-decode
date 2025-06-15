
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
      copyBtn: document.getElementById('copy-btn')
    };
  }

  showError(message) {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.textContent = message;
      this.elements.errorMessage.classList.remove('hidden');
    }
  }

  clearError() {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.classList.add('hidden');
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
      this.elements.authSubmit.textContent = loading 
        ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
        : (isSignUp ? 'Create Account' : 'Sign In');
    }
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
