
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, tone } = await req.json();
    
    if (!message || !tone) {
      throw new Error("Missing message or tone");
    }

    // Get Gemini API key from environment
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("Gemini API key not configured");
    }

    // Analyze intent first
    const intentPrompt = `Analyze this message and classify it into one of these categories: Business Inquiry, Client Lead, Casual Conversation, Spam, Support Request. 

Message: "${message}"

Respond with only the category name.`;

    const intentResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: intentPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 50,
        },
      }),
    });

    const intentData = await intentResponse.json();
    const intent = intentData.candidates[0].content.parts[0].text.trim();

    // Generate reply based on tone
    const toneInstructions = {
      friendly: "Write a warm, approachable, and friendly reply. Use casual language, show genuine interest, and include emojis where appropriate. Keep it conversational and welcoming.",
      formal: "Write a professional, polished, and business-appropriate reply. Use proper grammar, formal language, and maintain a respectful tone. Be courteous and professional throughout.",
      witty: "Write a clever, engaging, and slightly humorous reply. Be creative and entertaining while still being professional. Use wordplay or light humor where appropriate."
    };

    const replyPrompt = `You are helping someone reply to a message they received. ${toneInstructions[tone]} 

The message you need to reply to: "${message}"

Write a ${tone} reply that is:
- 2-3 sentences maximum
- Appropriate for the context
- Engaging and helpful
- Natural and conversational

Don't include formal greetings unless necessary. Focus on responding to the content of the message.`;

    const replyResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: replyPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        },
      }),
    });

    const replyData = await replyResponse.json();
    const suggestedReply = replyData.candidates[0].content.parts[0].text.trim();

    return new Response(
      JSON.stringify({ 
        intent,
        suggestedReply
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
