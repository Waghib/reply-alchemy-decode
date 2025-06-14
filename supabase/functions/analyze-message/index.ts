
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // Analyze intent first
    const intentResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing message intent. Classify the message into one of these categories: Business Inquiry, Client Lead, Casual Conversation, Spam, Support Request. Respond with only the category name."
          },
          {
            role: "user",
            content: message
          }
        ],
        max_tokens: 20,
        temperature: 0.3,
      }),
    });

    const intentData = await intentResponse.json();
    const intent = intentData.choices[0].message.content.trim();

    // Generate reply based on tone
    const toneInstructions = {
      friendly: "Write a warm, approachable, and friendly reply. Use casual language and show genuine interest.",
      formal: "Write a professional, polished, and business-appropriate reply. Use proper grammar and formal language.",
      witty: "Write a clever, engaging, and slightly humorous reply. Be creative but still professional."
    };

    const replyResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are helping someone reply to a message. ${toneInstructions[tone]} Keep the reply concise (2-3 sentences max) and appropriate for the context. Don't include greetings unless necessary.`
          },
          {
            role: "user",
            content: `Please write a ${tone} reply to this message: "${message}"`
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const replyData = await replyResponse.json();
    const suggestedReply = replyData.choices[0].message.content.trim();

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
