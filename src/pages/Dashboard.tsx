import { useState, useEffect } from "react";
import { MessageSquare, Copy, Sparkles, Zap, Brain, Crown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessageHistory } from "@/components/MessageHistory";

const Dashboard = () => {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intent, setIntent] = useState("");
  const [suggestedReply, setSuggestedReply] = useState("");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const { toast } = useToast();
  const { user, signOut, subscribed } = useAuth();

  const FREE_USAGE_LIMIT = 3; // Allow 3 free analyses

  const tones = [
    { id: "friendly", label: "Friendly", icon: "😊", description: "Warm and approachable" },
    { id: "formal", label: "Formal", icon: "👔", description: "Professional and polished" },
    { id: "witty", label: "Witty", icon: "🎭", description: "Clever and engaging" }
  ];

  // Load free usage count from localStorage
  useEffect(() => {
    if (user && !subscribed) {
      const savedCount = localStorage.getItem(`free_usage_${user.id}`);
      setFreeUsageCount(savedCount ? parseInt(savedCount) : 0);
    }
  }, [user, subscribed]);

  const updateFreeUsageCount = (newCount: number) => {
    if (user) {
      localStorage.setItem(`free_usage_${user.id}`, newCount.toString());
      setFreeUsageCount(newCount);
    }
  };

  const analyzeMessage = async () => {
    if (!message.trim()) return;
    
    // Check free usage limit for non-subscribers
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
        // Use the actual AI service for Pro users
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

        // Save the analysis to the database
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
        // Provide demo responses for free users
        const demoIntents = ["Business Inquiry", "Client Lead", "Casual Conversation", "Support Request"];
        const demoReplies = {
          friendly: "Thanks for reaching out! I'd be happy to help you with this. Let me know what specific information you need and I'll get back to you soon. 😊",
          formal: "Thank you for your inquiry. I appreciate you taking the time to contact me. I will review your request and provide a comprehensive response within the next business day.",
          witty: "Well hello there! 👋 Looks like you've got something interesting on your mind. I'm all ears (well, technically all eyes since this is text, but you get the idea)!"
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const randomIntent = demoIntents[Math.floor(Math.random() * demoIntents.length)];
        const demoReply = demoReplies[selectedTone as keyof typeof demoReplies];

        setIntent(randomIntent);
        setSuggestedReply(demoReply);

        // Update free usage count
        const newCount = freeUsageCount + 1;
        updateFreeUsageCount(newCount);

        toast({
          title: "Demo Analysis Complete",
          description: `${FREE_USAGE_LIMIT - newCount} free analyses remaining. Upgrade for AI-powered results!`,
        });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  DM Decoder
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Welcome back, {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {subscribed ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  <Crown className="h-3 w-3 mr-1" />
                  Pro
                </Badge>
              ) : (
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    Free: {freeUsageCount}/{FREE_USAGE_LIMIT} used
                  </Badge>
                  <Button onClick={handleUpgrade} size="sm">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Free vs Pro Notice */}
          {!subscribed && (
            <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                      {freeUsageCount >= FREE_USAGE_LIMIT ? "Free limit reached!" : "Free Demo Mode"}
                    </h3>
                    <p className="text-sm text-orange-600 dark:text-orange-400">
                      {freeUsageCount >= FREE_USAGE_LIMIT 
                        ? "Upgrade to Pro for unlimited AI-powered analysis" 
                        : `${FREE_USAGE_LIMIT - freeUsageCount} demo analyses remaining. Pro users get unlimited AI-powered results!`
                      }
                    </p>
                  </div>
                  <Button onClick={handleUpgrade}>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Section */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-violet-600" />
                <span>Paste Your Message</span>
              </CardTitle>
              <CardDescription>
                Drop in any DM, email, or message you've received and I'll analyze it for you
                {!subscribed && (
                  <span className="block text-orange-600 dark:text-orange-400 mt-1">
                    Demo mode: Get sample responses to test the feature
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Hey! I saw your work and I'm really interested in collaborating. Would love to discuss a potential project with you..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] resize-none border-slate-200 dark:border-slate-700 focus:border-violet-500 dark:focus:border-violet-400"
              />
              <Button 
                onClick={analyzeMessage}
                disabled={!message.trim() || isAnalyzing || (!subscribed && freeUsageCount >= FREE_USAGE_LIMIT)}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
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

          {/* Results Section */}
          {intent && (
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

              {/* Tone Selection */}
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Choose Your Tone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {tones.map((tone) => (
                      <Button
                        key={tone.id}
                        variant={selectedTone === tone.id ? "default" : "outline"}
                        className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                          selectedTone === tone.id 
                            ? "bg-violet-600 hover:bg-violet-700 text-white" 
                            : "hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                        onClick={() => setSelectedTone(tone.id)}
                      >
                        <span className="text-2xl">{tone.icon}</span>
                        <div className="text-center">
                          <div className="font-medium">{tone.label}</div>
                          <div className="text-xs opacity-70">{tone.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
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
                    onClick={copyToClipboard}
                    variant="outline"
                    className="w-full md:w-auto"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Reply
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Message History - Only show for Pro users */}
          {subscribed && <MessageHistory />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
