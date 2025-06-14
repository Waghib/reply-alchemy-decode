import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Clock, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AnalyzedMessage {
  id: string;
  original_message: string;
  detected_intent: string;
  suggested_reply: string;
  selected_tone: string;
  created_at: string;
}

export const MessageHistory = () => {
  const [messages, setMessages] = useState<AnalyzedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('analyzed_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load message history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Reply copied to clipboard",
    });
  };

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

  if (loading) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
            <span>Recent Analyses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6 sm:py-8">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-violet-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
            <span>Recent Analyses</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Your analyzed messages will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 sm:py-8 text-slate-500 dark:text-slate-400">
            <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base">No analyses yet. Start by analyzing your first message!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm sm:text-base">
          <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600" />
          <span>Recent Analyses</span>
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Your last 10 analyzed messages
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={`${getIntentColor(message.detected_intent)} px-2 py-1 text-xs`}>
                {message.detected_intent}
              </Badge>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(message.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Original Message:</p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 p-2 rounded text-left">
                  {message.original_message.substring(0, 100)}
                  {message.original_message.length > 100 && "..."}
                </p>
              </div>
              
              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">Suggested Reply ({message.selected_tone}):</p>
                <div className="flex items-start space-x-2">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700 p-2 rounded flex-1 text-left">
                    {message.suggested_reply}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(message.suggested_reply)}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
