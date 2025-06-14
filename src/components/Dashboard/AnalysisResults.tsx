
import { Copy } from "lucide-react";
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
    <div className="space-y-6">
      {/* Intent Detection */}
      <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Intent Detected
            {!subscribed && (
              <Badge variant="outline" className="text-xs">
                Demo Result
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={`${getIntentColor(intent)} px-3 py-1`}>
            {intent}
          </Badge>
        </CardContent>
      </Card>

      {/* Suggested Reply */}
      <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            Suggested Reply
            {!subscribed && (
              <Badge variant="outline" className="text-xs">
                Demo Response
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {subscribed ? "AI-generated response in your selected tone" : "Sample response to demonstrate the feature"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border-l-4 border-violet-500">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {suggestedReply}
            </p>
          </div>
          <Button 
            onClick={onCopyReply}
            variant="outline"
            className="w-full md:w-auto"
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
