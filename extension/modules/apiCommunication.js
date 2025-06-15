
// API communication with Supabase backend
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = "https://aodowsouzxzjuvroqule.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZG93c291enh6anV2cm9xdWxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDA1MjQsImV4cCI6MjA2NTQ3NjUyNH0.Ez5lIB3pF2Hguyn5BgPKhUUbSwL977-edi-wgrHFca4";

export class APICommunication {
  constructor() {
    this.supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  async analyzeMessage(message, tone) {
    try {
      // Use the same demo analysis function as the web app
      const { data, error } = await this.supabase.functions.invoke('generate-demo-reply', {
        body: { message, tone }
      });
      
      if (error) throw error;
      
      return {
        success: true,
        data: {
          intent: data.intent,
          suggestedReply: data.suggestedReply
        }
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
        data: {
          intent: 'Business Inquiry',
          suggestedReply: demoResponses[tone] || demoResponses.friendly
        }
      };
    }
  }
}
