
// Widget creation and management functionality
export class WidgetManager {
  constructor() {
    this.floatingWidget = null;
    this.setupWidget();
  }

  setupWidget() {
    this.createFloatingWidget();
    this.setupWidgetEvents();
  }

  createFloatingWidget() {
    this.floatingWidget = document.createElement('div');
    this.floatingWidget.id = 'dm-decoder-widget';
    this.floatingWidget.innerHTML = `
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
    
    this.floatingWidget.style.display = 'none';
    document.body.appendChild(this.floatingWidget);
  }

  setupWidgetEvents() {
    document.getElementById('dm-close-btn').addEventListener('click', () => {
      this.hideWidget();
    });
    
    document.querySelectorAll('.dm-tone-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.dm-tone-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });
    
    document.getElementById('dm-open-popup').addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openPopup' });
      this.hideWidget();
    });
  }

  showWidget() {
    this.floatingWidget.style.display = 'block';
    this.floatingWidget.style.position = 'fixed';
    this.floatingWidget.style.top = '20px';
    this.floatingWidget.style.right = '20px';
    this.floatingWidget.style.zIndex = '999999';
  }

  hideWidget() {
    this.floatingWidget.style.display = 'none';
  }

  resetWidget() {
    document.getElementById('dm-input-section').style.display = 'block';
    document.getElementById('dm-results-section').style.display = 'none';
    document.getElementById('dm-message-input').value = '';
  }

  showResults(intent, reply) {
    document.getElementById('dm-intent-result').textContent = intent;
    document.getElementById('dm-reply-result').textContent = reply;
    
    document.getElementById('dm-input-section').style.display = 'none';
    document.getElementById('dm-results-section').style.display = 'block';
  }
}
