
// API communication with the web app
export class APICommunication {
  constructor() {
    this.webAppUrl = 'https://reply-mind.lovable.app';
  }

  async analyzeMessage(message, tone) {
    return new Promise((resolve) => {
      // Create iframe for API communication
      const webAppFrame = document.createElement('iframe');
      webAppFrame.src = this.webAppUrl;
      webAppFrame.style.display = 'none';
      document.body.appendChild(webAppFrame);
      
      // Wait for iframe to load and then send API request
      webAppFrame.onload = () => {
        webAppFrame.contentWindow.postMessage({
          type: 'EXTENSION_API_REQUEST',
          path: '/api/demo-analyze',
          method: 'POST',
          body: { message, tone }
        }, this.webAppUrl);
      };
      
      // Listen for response
      const responseHandler = (event) => {
        if (event.origin !== this.webAppUrl) return;
        
        if (event.data.type === 'EXTENSION_API_RESPONSE') {
          window.removeEventListener('message', responseHandler);
          document.body.removeChild(webAppFrame);
          
          if (event.data.success) {
            resolve({
              success: true,
              data: event.data.data
            });
          } else {
            resolve({
              success: false,
              error: event.data.error
            });
          }
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
        
        resolve({
          success: true,
          data: {
            intent: 'Business Inquiry',
            suggestedReply: demoResponses[tone] || demoResponses.friendly
          }
        });
      }, 5000);
    });
  }
}
