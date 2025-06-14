
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
    <div className="space-y-4">
      {/* Intent Detection */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Intent Detected</span>
            </CardTitle>
            {!subscribed && (
              <Badge variant="outline" className="text-xs">
                Demo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Badge className={`${getIntentColor(intent)} px-3 py-1 text-sm`}>
            {intent}
          </Badge>
        </CardContent>
      </Card>

      {/* Suggested Reply */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Suggested Reply</CardTitle>
            {!subscribed && (
              <Badge variant="outline" className="text-xs">
                Demo
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            {subscribed ? "AI-generated response in your selected tone" : "Sample response"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-violet-500">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
              {suggestedReply}
            </p>
          </div>
          <Button 
            onClick={onCopyReply}
            variant="outline"
            className="w-full"
            size="sm"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Reply
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;
