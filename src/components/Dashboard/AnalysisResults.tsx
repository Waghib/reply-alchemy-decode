
import { Copy, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AnalysisResultsProps {
  intent: string;
  suggestedReply: string;
  subscribed: boolean;
  onCopyReply: () => void;
}

const AnalysisResults = ({ intent, suggestedReply, subscribed, onCopyReply }: AnalysisResultsProps) => {
  const getIntentColor = (intentType: string) => {
    const colors = {
      "Business Inquiry": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Client Lead": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Casual Conversation": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "Spam": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      "Support Request": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    };
    return colors[intentType] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  if (!intent) return null;

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="pb-1 sm:pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            <span>Analysis Results</span>
          </CardTitle>
          {!subscribed && (
            <Badge variant="outline" className="text-xs">
              Demo
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          {subscribed ? "AI-powered intent detection and response generation" : "Sample analysis and response"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
        {/* Intent Detection - Compact */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Intent:</span>
          <Badge className={`${getIntentColor(intent)} px-1.5 sm:px-2 py-0.5 text-xs`}>
            {intent}
          </Badge>
        </div>

        {/* Suggested Reply */}
        <div className="flex-grow flex flex-col space-y-1 sm:space-y-2 min-h-0">
          <div className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex-shrink-0">Suggested Reply</div>
          <div className="flex-grow p-2 sm:p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-violet-500 min-h-0 overflow-hidden">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm h-full overflow-y-auto">
              {suggestedReply}
            </p>
          </div>
          <Button 
            onClick={onCopyReply}
            variant="outline"
            className="w-full flex-shrink-0 h-8 sm:h-10 text-xs sm:text-sm"
            size="sm"
          >
            <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden sm:inline">Copy Reply</span>
            <span className="sm:hidden">Copy</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisResults;
