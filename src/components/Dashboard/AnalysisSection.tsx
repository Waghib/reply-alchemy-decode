
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MessageInput from "./MessageInput";
import ToneSelector from "./ToneSelector";
import AnalysisResults from "./AnalysisResults";

interface AnalysisSectionProps {
  user: any;
  subscribed: boolean;
  freeUsageCount: number;
  loadingUsage: boolean;
  onDemoUsage: () => Promise<void>;
  checkUsageLimit: () => boolean;
}

const AnalysisSection = ({ 
  user, 
  subscribed, 
  freeUsageCount, 
  loadingUsage, 
  onDemoUsage, 
  checkUsageLimit 
}: AnalysisSectionProps) => {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intent, setIntent] = useState("");
  const [suggestedReply, setSuggestedReply] = useState("");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const { toast } = useToast();

  const analyzeMessage = async () => {
    if (!message.trim()) return;
    
    if (!checkUsageLimit()) return;

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
        // Use Gemini API for demo analysis
        const { data, error } = await supabase.functions.invoke('generate-demo-reply', {
          body: { message, tone: selectedTone },
        });

        if (error) throw error;

        setIntent(data.intent);
        setSuggestedReply(data.suggestedReply);

        await onDemoUsage();
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Input and Controls */}
      <div className="space-y-6">
        <MessageInput 
          message={message}
          setMessage={setMessage}
          isAnalyzing={isAnalyzing}
          subscribed={subscribed}
          freeUsageCount={freeUsageCount}
          loadingUsage={loadingUsage}
          onAnalyze={analyzeMessage}
        />

        <ToneSelector 
          selectedTone={selectedTone}
          onToneSelect={setSelectedTone}
        />
      </div>

      {/* Right Column - Results */}
      <div className="space-y-6">
        {intent ? (
          <AnalysisResults 
            intent={intent}
            suggestedReply={suggestedReply}
            subscribed={subscribed}
            onCopyReply={copyToClipboard}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-500 dark:text-slate-400">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
              <p className="text-lg font-medium mb-2">Ready to analyze</p>
              <p className="text-sm">Paste a message and click analyze to see the results here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisSection;
