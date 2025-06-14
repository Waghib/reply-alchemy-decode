
import { Brain, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface MessageInputProps {
  message: string;
  setMessage: (message: string) => void;
  isAnalyzing: boolean;
  subscribed: boolean;
  freeUsageCount: number;
  loadingUsage: boolean;
  onAnalyze: () => void;
}

const MessageInput = ({ 
  message, 
  setMessage, 
  isAnalyzing, 
  subscribed, 
  freeUsageCount, 
  loadingUsage, 
  onAnalyze 
}: MessageInputProps) => {
  const FREE_USAGE_LIMIT = 3;

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Brain className="h-4 w-4 text-violet-600" />
          <span>Paste Your Message</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Drop in any DM, email, or message you've received
          {!subscribed && (
            <span className="block text-orange-600 dark:text-orange-400 mt-1">
              Demo mode: Get sample responses to test the feature
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Textarea
          placeholder="Hey! I saw your work and I'm really interested in collaborating. Would love to discuss a potential project with you..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[80px] resize-none border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400 text-sm"
          rows={3}
        />
        <Button 
          onClick={onAnalyze}
          disabled={!message.trim() || isAnalyzing || (!subscribed && freeUsageCount >= FREE_USAGE_LIMIT) || loadingUsage}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              {subscribed ? "Analyze & Generate Reply" : "Try Demo Analysis"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MessageInput;
