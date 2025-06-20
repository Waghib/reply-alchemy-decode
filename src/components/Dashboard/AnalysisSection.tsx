import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import MessageInput from "./MessageInput";
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
  const isMobile = useIsMobile();

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
    <div className={`grid gap-3 sm:gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'} ${isMobile ? 'h-auto' : 'h-80 lg:h-96'}`}>
      {/* Input Section */}
      <div className={`${isMobile ? 'h-auto min-h-[280px]' : 'h-full'}`}>
        <MessageInput 
          message={message}
          setMessage={setMessage}
          isAnalyzing={isAnalyzing}
          subscribed={subscribed}
          freeUsageCount={freeUsageCount}
          loadingUsage={loadingUsage}
          selectedTone={selectedTone}
          onToneSelect={setSelectedTone}
          onAnalyze={analyzeMessage}
        />
      </div>

      {/* Results Section */}
      <div className={`${isMobile ? 'h-auto min-h-[280px]' : 'h-full'}`}>
        {intent ? (
          <AnalysisResults 
            intent={intent}
            suggestedReply={suggestedReply}
            subscribed={subscribed}
            onCopyReply={copyToClipboard}
          />
        ) : (
          <div className="h-full flex items-center justify-center border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg min-h-[200px]">
            <div className="text-center text-slate-500 dark:text-slate-400 px-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <span className="text-lg sm:text-xl">💬</span>
              </div>
              <p className="text-sm sm:text-base font-medium mb-1">Ready to analyze</p>
              <p className="text-xs sm:text-sm">Paste a message and click analyze to see results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisSection;
