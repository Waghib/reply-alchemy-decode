
// Content script for DM Decoder extension
let isActive = true;
let floatingWidget = null;
let selectedText = '';

// Initialize extension when content script loads
(function init() {
  console.log('DM Decoder extension loaded');
  createFloatingWidget();
  setupTextSelection();
})();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'toggleExtension':
      toggleExtension(request.active);
      break;
    case 'analyzeText':
      analyzeSelectedText(request.text);
      break;
  }
});

function createFloatingWidget() {
  // Create floating analysis widget
  floatingWidget = document.createElement('div');
  floatingWidget.id = 'dm-decoder-widget';
  floatingWidget.innerHTML = `
    <div class="dm-decoder-header">
      <span>🧠 DM Decoder</span>
      <button id="dm-close-btn">×</button>
    </div>
    <div class="dm-decoder-content">
      <div id="dm-input-section">
        <textarea id="dm-message-input" placeholder="Paste message to analyze..."></textarea>
        <div class="dm-tone-buttons">
          <button class="dm-tone-btn active" data-tone="friendly">😊 Friendly</button>
          <button class="dm-tone-btn" data-tone="formal">👔 Formal</button>
          <button class="dm-tone-btn" data-tone="witty">🎭 Witty</button>
        </div>
        <button id="dm-analyze-btn">Analyze Message</button>
      </div>
      <div id="dm-results-section" style="display: none;">
        <div class="dm-result-item">
          <strong>Intent:</strong>
          <span id="dm-intent-result"></span>
        </div>
        <div class="dm-result-item">
          <strong>Suggested Reply:</strong>
          <div id="dm-reply-result"></div>
          <button id="dm-copy-btn">Copy Reply</button>
        </div>
        <button id="dm-new-analysis">New Analysis</button>
        <button id="dm-open-popup">Open Extension</button>
      </div>
    </div>
  `;
  
  floatingWidget.style.display = 'none';
  document.body.appendChild(floatingWidget);
  
  setupWidgetEvents();
}

function setupWidgetEvents() {
  // Close button
  document.getElementById('dm-close-btn').addEventListener('click', () => {
    hideWidget();
  });
  
  // Tone selection
  document.querySelectorAll('.dm-tone-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.dm-tone-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });
  
  // Analyze button
  document.getElementById('dm-analyze-btn').addEventListener('click', analyzeMessage);
  
  // Copy button
  document.getElementById('dm-copy-btn').addEventListener('click', copyReply);
  
  // New analysis button
  document.getElementById('dm-new-analysis').addEventListener('click', resetWidget);
  
  // Open popup button
  document.getElementById('dm-open-popup').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
    hideWidget();
  });
}

function setupTextSelection() {
  document.addEventListener('mouseup', (e) => {
    const selection = window.getSelection();
    if (selection.toString().length > 10 && isActive) {
      selectedText = selection.toString();
      showQuickAnalyzeButton(e.pageX, e.pageY);
    }
  });
}

function showQuickAnalyzeButton(x, y) {
  // Remove existing quick button
  const existingBtn = document.getElementById('dm-quick-analyze');
  if (existingBtn) existingBtn.remove();
  
  // Create quick analyze button
  const quickBtn = document.createElement('button');
  quickBtn.id = 'dm-quick-analyze';
  quickBtn.innerHTML = '🧠 Analyze';
  quickBtn.className = 'dm-quick-btn';
  quickBtn.style.position = 'absolute';
  quickBtn.style.left = x + 'px';
  quickBtn.style.top = (y - 40) + 'px';
  quickBtn.style.zIndex = '999999';
  
  quickBtn.addEventListener('click', () => {
    analyzeSelectedText(selectedText);
    quickBtn.remove();
  });
  
  document.body.appendChild(quickBtn);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (quickBtn.parentNode) quickBtn.remove();
  }, 3000);
}

function toggleExtension(active) {
  isActive = active;
  if (!active) {
    hideWidget();
    const quickBtn = document.getElementById('dm-quick-analyze');
    if (quickBtn) quickBtn.remove();
  }
}

function showWidget() {
  floatingWidget.style.display = 'block';
  floatingWidget.style.position = 'fixed';
  floatingWidget.style.top = '20px';
  floatingWidget.style.right = '20px';
  floatingWidget.style.zIndex = '999999';
}

function hideWidget() {
  floatingWidget.style.display = 'none';
}

function analyzeSelectedText(text) {
  document.getElementById('dm-message-input').value = text;
  showWidget();
  analyzeMessage();
}

async function analyzeMessage() {
  const messageInput = document.getElementById('dm-message-input');
  const message = messageInput.value.trim();
  
  if (!message) {
    alert('Please enter a message to analyze');
    return;
  }
  
  const selectedTone = document.querySelector('.dm-tone-btn.active').dataset.tone;
  const analyzeBtn = document.getElementById('dm-analyze-btn');
  
  analyzeBtn.textContent = 'Analyzing...';
  analyzeBtn.disabled = true;
  
  try {
    // Try to use the web app's API through iframe communication
    const webAppFrame = document.createElement('iframe');
    webAppFrame.src = 'https://reply-mind.lovable.app';
    webAppFrame.style.display = 'none';
    document.body.appendChild(webAppFrame);
    
    // Wait for iframe to load and then send API request
    webAppFrame.onload = () => {
      webAppFrame.contentWindow.postMessage({
        type: 'EXTENSION_API_REQUEST',
        path: '/api/demo-analyze',
        method: 'POST',
        body: { message, tone: selectedTone }
      }, 'https://reply-mind.lovable.app');
    };
    
    // Listen for response
    const responseHandler = (event) => {
      if (event.origin !== 'https://reply-mind.lovable.app') return;
      
      if (event.data.type === 'EXTENSION_API_RESPONSE') {
        window.removeEventListener('message', responseHandler);
        document.body.removeChild(webAppFrame);
        
        if (event.data.success) {
          showResults(event.data.data.intent, event.data.data.suggestedReply);
        } else {
          throw new Error(event.data.error);
        }
        
        analyzeBtn.textContent = 'Analyze Message';
        analyzeBtn.disabled = false;
      }
    };
    
    window.addEventListener('message', responseHandler);
    
    // Fallback timeout
    setTimeout(() => {
      window.removeEventListener('message', responseHandler);
      if (webAppFrame.parentNode) {
        document.body.removeChild(webAppFrame);
      }
      
      // Use fallback demo response
      const demoResponses = {
        friendly: "Thanks for reaching out! I'd be happy to help with this. When would be a good time to discuss further?",
        formal: "Thank you for your inquiry. I would be pleased to assist you with this matter. Please let me know when we can schedule a discussion.",
        witty: "Well hello there! Looks like you've got something interesting brewing. I'm all ears! 👂"
      };
      
      showResults('Business Inquiry', demoResponses[selectedTone] || demoResponses.friendly);
      
      analyzeBtn.textContent = 'Analyze Message';
      analyzeBtn.disabled = false;
    }, 5000);
    
  } catch (error) {
    console.error('Analysis error:', error);
    // Fallback demo response
    const demoResponses = {
      friendly: "Thanks for reaching out! I'd be happy to help with this. When would be a good time to discuss further?",
      formal: "Thank you for your inquiry. I would be pleased to assist you with this matter. Please let me know when we can schedule a discussion.",
      witty: "Well hello there! Looks like you've got something interesting brewing. I'm all ears! 👂"
    };
    
    showResults('Business Inquiry', demoResponses[selectedTone] || demoResponses.friendly);
    
    analyzeBtn.textContent = 'Analyze Message';
    analyzeBtn.disabled = false;
  }
}

function showResults(intent, reply) {
  document.getElementById('dm-intent-result').textContent = intent;
  document.getElementById('dm-reply-result').textContent = reply;
  
  document.getElementById('dm-input-section').style.display = 'none';
  document.getElementById('dm-results-section').style.display = 'block';
}

function copyReply() {
  const replyText = document.getElementById('dm-reply-result').textContent;
  navigator.clipboard.writeText(replyText).then(() => {
    const copyBtn = document.getElementById('dm-copy-btn');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy Reply';
    }, 2000);
  });
}

function resetWidget() {
  document.getElementById('dm-input-section').style.display = 'block';
  document.getElementById('dm-results-section').style.display = 'none';
  document.getElementById('dm-message-input').value = '';
}
