
export class AnalysisManager {
  constructor(supabase) {
    this.supabase = supabase;
  }

  getSelectedTone() {
    const selectedToneBtn = document.querySelector('.tone-btn.active');
    return selectedToneBtn ? selectedToneBtn.dataset.tone : 'friendly';
  }

  async analyzeMessage(message, tone) {
    try {
      const { data, error } = await this.supabase.functions.invoke('generate-demo-reply', {
        body: { message, tone }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        intent: data.intent,
        suggestedReply: data.suggestedReply
      };
      
    } catch (error) {
      console.error('Analysis error:', error);
      
      // Fallback demo responses
      const demoResponses = {
        friendly: "Thanks for reaching out! I'd be happy to help with this. When would be a good time to discuss further?",
        formal: "Thank you for your inquiry. I would be pleased to assist you with this matter. Please let me know when we can schedule a discussion.",
        witty: "Well hello there! Looks like you've got something interesting brewing. I'm all ears! 👂"
      };
      
      return {
        success: true,
        intent: 'Business Inquiry',
        suggestedReply: demoResponses[tone] || demoResponses.friendly
      };
    }
  }

  copyReply() {
    const replyResult = document.getElementById('reply-result');
    const replyText = replyResult ? replyResult.textContent : '';
    
    return navigator.clipboard.writeText(replyText).then(() => {
      return true;
    }).catch(() => {
      return false;
    });
  }
}
