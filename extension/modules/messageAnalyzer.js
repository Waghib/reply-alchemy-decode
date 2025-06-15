
// Message analysis functionality
export class MessageAnalyzer {
  constructor(apiCommunication, widgetManager) {
    this.apiCommunication = apiCommunication;
    this.widgetManager = widgetManager;
    this.setupAnalyzeEvents();
  }

  setupAnalyzeEvents() {
    document.getElementById('dm-analyze-btn').addEventListener('click', () => {
      this.analyzeMessage();
    });
    
    document.getElementById('dm-copy-btn').addEventListener('click', () => {
      this.copyReply();
    });
    
    document.getElementById('dm-new-analysis').addEventListener('click', () => {
      this.widgetManager.resetWidget();
    });
  }

  async analyzeMessage() {
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
      const result = await this.apiCommunication.analyzeMessage(message, selectedTone);
      
      if (result.success) {
        this.widgetManager.showResults(result.data.intent, result.data.suggestedReply);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      console.error('Analysis error:', error);
      // Fallback demo response
      const demoResponses = {
        friendly: "Thanks for reaching out! I'd be happy to help with this. When would be a good time to discuss further?",
        formal: "Thank you for your inquiry. I would be pleased to assist you with this matter. Please let me know when we can schedule a discussion.",
        witty: "Well hello there! Looks like you've got something interesting brewing. I'm all ears! 👂"
      };
      
      const selectedTone = document.querySelector('.dm-tone-btn.active').dataset.tone;
      this.widgetManager.showResults('Business Inquiry', demoResponses[selectedTone] || demoResponses.friendly);
      
    } finally {
      analyzeBtn.textContent = 'Analyze Message';
      analyzeBtn.disabled = false;
    }
  }

  copyReply() {
    const replyText = document.getElementById('dm-reply-result').textContent;
    navigator.clipboard.writeText(replyText).then(() => {
      const copyBtn = document.getElementById('dm-copy-btn');
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy Reply';
      }, 2000);
    });
  }

  analyzeSelectedText(text) {
    document.getElementById('dm-message-input').value = text;
    this.widgetManager.showWidget();
    this.analyzeMessage();
  }
}
