
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
  selectedTone: string;
  onToneSelect: (tone: string) => void;
  onAnalyze: () => void;
}

const MessageInput = ({ 
  message, 
  setMessage, 
  isAnalyzing, 
  subscribed, 
  freeUsageCount, 
  loadingUsage,
  selectedTone,
  onToneSelect,
  onAnalyze 
}: MessageInputProps) => {
  const FREE_USAGE_LIMIT = 3;

  const tones = [
    { id: "friendly", label: "Friendly", icon: "😊" },
    { id: "formal", label: "Formal", icon: "👔" },
    { id: "witty", label: "Witty", icon: "🎭" }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-1 sm:pb-2 flex-shrink-0">
        <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
          <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-violet-600" />
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
      <CardContent className="flex-grow flex flex-col p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
        <Textarea
          placeholder="Hey! I saw your work and I'm really interested in collaborating. Would love to discuss a potential project with you..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="h-16 sm:h-20 md:h-24 resize-none border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400 text-xs sm:text-sm"
          rows={3}
        />
        
        {/* Inline Tone Selection */}
        <div className="space-y-1 sm:space-y-2 flex-shrink-0">
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tone:</label>
          <div className="flex gap-1 sm:gap-2">
            {tones.map((tone) => (
              <Button
                key={tone.id}
                variant={selectedTone === tone.id ? "default" : "outline"}
                size="sm"
                className={`flex-1 h-6 sm:h-8 text-xs transition-all ${
                  selectedTone === tone.id 
                    ? "bg-violet-600 hover:bg-violet-700 text-white" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
                onClick={() => onToneSelect(tone.id)}
              >
                <span className="mr-1 text-xs">{tone.icon}</span>
                <span className="hidden xs:inline">{tone.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={onAnalyze}
          disabled={!message.trim() || isAnalyzing || (!subscribed && freeUsageCount >= FREE_USAGE_LIMIT) || loadingUsage}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 flex-shrink-0 h-8 sm:h-10 text-xs sm:text-sm"
          size="sm"
        >
          {isAnalyzing ? (
            <>
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-2 animate-spin" />
              <span className="hidden sm:inline">Analyzing...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
              <span className="hidden sm:inline">{subscribed ? "Analyze & Generate Reply" : "Try Demo Analysis"}</span>
              <span className="sm:hidden">Analyze</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MessageInput;
