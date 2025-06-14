
import { useState } from "react";
import { MessageSquare, Copy, Sparkles, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [intent, setIntent] = useState("");
  const [suggestedReply, setSuggestedReply] = useState("");
  const [selectedTone, setSelectedTone] = useState("friendly");
  const { toast } = useToast();

  const tones = [
    { id: "friendly", label: "Friendly", icon: "😊", description: "Warm and approachable" },
    { id: "formal", label: "Formal", icon: "👔", description: "Professional and polished" },
    { id: "witty", label: "Witty", icon: "🎭", description: "Clever and engaging" }
  ];

  const analyzeMessage = async () => {
    if (!message.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate API call for now
    setTimeout(() => {
      // Mock intent detection
      const intents = ["Business Inquiry", "Client Lead", "Casual Conversation", "Spam", "Support Request"];
      const randomIntent = intents[Math.floor(Math.random() * intents.length)];
      setIntent(randomIntent);
      
      // Mock reply generation based on tone
      const replies = {
        friendly: "Thanks for reaching out! I'd love to help you with this. When would be a good time to chat?",
        formal: "Thank you for your inquiry. I would be pleased to discuss this opportunity with you at your earliest convenience.",
        witty: "Well hello there! Looks like you've got something interesting cooking. Let's dive in! 🚀"
      };
      
      setSuggestedReply(replies[selectedTone]);
      setIsAnalyzing(false);
    }, 1500);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(suggestedReply);
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
                  AI-powered message analysis and reply suggestions
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Input Section */}
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-violet-600" />
                <span>Paste Your Message</span>
              </CardTitle>
              <CardDescription>
                Drop in any DM, email, or message you've received and I'll analyze it for you
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
                disabled={!message.trim() || isAnalyzing}
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
                    Analyze & Generate Reply
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
                  <CardTitle className="text-lg">Intent Detected</CardTitle>
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
                  <CardTitle className="text-lg">Suggested Reply</CardTitle>
                  <CardDescription>
                    AI-generated response in your selected tone
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

          {/* CTA Section */}
          {!intent && (
            <Card className="border-0 shadow-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto text-violet-600 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Ready to decode your messages?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Paste any message above and let AI analyze the intent and suggest the perfect reply
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-slate-500">
                  <span>✨ Intent Detection</span>
                  <span>📝 Smart Replies</span>
                  <span>🎭 Multiple Tones</span>
                  <span>📱 Mobile Friendly</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
