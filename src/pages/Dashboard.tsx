
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessageHistory } from "@/components/MessageHistory";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import FreeUsageNotice from "@/components/Dashboard/FreeUsageNotice";
import MessageInput from "@/components/Dashboard/MessageInput";
import ToneSelector from "@/components/Dashboard/ToneSelector";
import AnalysisResults from "@/components/Dashboard/AnalysisResults";

const Dashboard = () => {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intent, setIntent] = useState("");
  const [suggestedReply, setSuggestedReply] = useState("");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const { toast } = useToast();
  const { user, signOut, subscribed } = useAuth();

  const FREE_USAGE_LIMIT = 3;

  // Load free usage count from database
  useEffect(() => {
    const loadFreeUsage = async () => {
      if (!user || subscribed) {
        setLoadingUsage(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('free_usage_tracking')
          .select('usage_count')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading free usage:', error);
          return;
        }

        setFreeUsageCount(data?.usage_count || 0);
      } catch (error) {
        console.error('Error loading free usage:', error);
      } finally {
        setLoadingUsage(false);
      }
    };

    loadFreeUsage();
  }, [user, subscribed]);

  const updateFreeUsageCount = async (newCount: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('free_usage_tracking')
        .upsert({
          user_id: user.id,
          usage_count: newCount,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating free usage:', error);
        return false;
      }

      setFreeUsageCount(newCount);
      return true;
    } catch (error) {
      console.error('Error updating free usage:', error);
      return false;
    }
  };

  const analyzeMessage = async () => {
    if (!message.trim()) return;
    
    if (!subscribed && freeUsageCount >= FREE_USAGE_LIMIT) {
      toast({
        title: "Free Limit Reached",
        description: `You've used all ${FREE_USAGE_LIMIT} free analyses. Upgrade to Pro for unlimited usage.`,
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      if (subscribed) {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          throw new Error("Not authenticated");
        }

        const { data, error } = await supabase.functions.invoke('analyze-message', {
          body: { message, tone: selectedTone },
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        });

        if (error) throw error;

        setIntent(data.intent);
        setSuggestedReply(data.suggestedReply);

        const { error: saveError } = await supabase
          .from('analyzed_messages')
          .insert({
            user_id: user?.id,
            original_message: message,
            detected_intent: data.intent,
            suggested_reply: data.suggestedReply,
            selected_tone: selectedTone,
          });

        if (saveError) {
          console.error('Error saving analysis:', saveError);
        }
      } else {
        const demoIntents = ["Business Inquiry", "Client Lead", "Casual Conversation", "Support Request"];
        const demoReplies = {
          friendly: "Thanks for reaching out! I'd be happy to help you with this. Let me know what specific information you need and I'll get back to you soon. 😊",
          formal: "Thank you for your inquiry. I appreciate you taking the time to contact me. I will review your request and provide a comprehensive response within the next business day.",
          witty: "Well hello there! 👋 Looks like you've got something interesting on your mind. I'm all ears (well, technically all eyes since this is text, but you get the idea)!"
        };

        await new Promise(resolve => setTimeout(resolve, 1500));

        const randomIntent = demoIntents[Math.floor(Math.random() * demoIntents.length)];
        const demoReply = demoReplies[selectedTone as keyof typeof demoReplies];

        setIntent(randomIntent);
        setSuggestedReply(demoReply);

        const newCount = freeUsageCount + 1;
        const updateSuccess = await updateFreeUsageCount(newCount);
        
        if (updateSuccess) {
          const remainingAnalyses = FREE_USAGE_LIMIT - newCount;
          toast({
            title: "Demo Analysis Complete",
            description: remainingAnalyses > 0 
              ? `${remainingAnalyses} free analyses remaining. Upgrade for AI-powered results!`
              : "You've used all your free analyses. Upgrade to Pro for unlimited AI-powered results!",
          });
        } else {
          toast({
            title: "Demo Analysis Complete",
            description: "Note: Unable to update usage count. Please refresh and try again.",
            variant: "destructive",
          });
        }
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze message",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestedReply);
    toast({
      title: "Copied!",
      description: "Reply copied to clipboard",
    });
  };

  const handleUpgrade = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`,
        },
      });

      if (error) throw error;

      window.open(data.url, '_blank');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader 
        user={user}
        subscribed={subscribed}
        freeUsageCount={freeUsageCount}
        loadingUsage={loadingUsage}
        onUpgrade={handleUpgrade}
        onSignOut={signOut}
      />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <FreeUsageNotice 
            subscribed={subscribed}
            freeUsageCount={freeUsageCount}
            onUpgrade={handleUpgrade}
          />

          <MessageInput 
            message={message}
            setMessage={setMessage}
            isAnalyzing={isAnalyzing}
            subscribed={subscribed}
            freeUsageCount={freeUsageCount}
            loadingUsage={loadingUsage}
            onAnalyze={analyzeMessage}
          />

          {intent && (
            <div className="space-y-6">
              <AnalysisResults 
                intent={intent}
                suggestedReply={suggestedReply}
                subscribed={subscribed}
                onCopyReply={copyToClipboard}
              />

              <ToneSelector 
                selectedTone={selectedTone}
                onToneSelect={setSelectedTone}
              />
            </div>
          )}

          {subscribed && <MessageHistory />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
