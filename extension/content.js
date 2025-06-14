
// Content script for DM Decoder extension
let isActive = false;
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
    // Call your existing API
    const response = await fetch('https://reply-mind.lovable.app/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        tone: selectedTone
      })
    });
    
    if (!response.ok) {
      throw new Error('Analysis failed');
    }
    
    const result = await response.json();
    showResults(result.intent, result.suggestedReply);
    
  } catch (error) {
    console.error('Analysis error:', error);
    // Fallback to demo analysis for now
    showResults('Business Inquiry', `Thanks for reaching out! I'd be happy to discuss this further. When would be a good time to chat?`);
  } finally {
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
