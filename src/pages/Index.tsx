
import { useState } from "react";
import { MessageSquare, Sparkles, Check, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthModal } from "@/components/Auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

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
            <Button onClick={() => setAuthModalOpen(true)}>
              <LogIn className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Decode Any Message
            </h2>
            <h3 className="text-2xl text-slate-600 dark:text-slate-400">
              Get AI-powered intent analysis and smart reply suggestions
            </h3>
            <p className="text-lg text-slate-500 dark:text-slate-500 max-w-2xl mx-auto">
              Never wonder what someone really means or struggle with the perfect response again. 
              Our AI analyzes message intent and crafts human-like replies in your preferred tone.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              onClick={() => setAuthModalOpen(true)}
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <span>Intent Detection</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Instantly understand if it's a business inquiry, client lead, casual chat, or spam.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <span>Smart Replies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Get perfectly crafted responses that sound natural and match your communication style.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <span className="text-purple-600 dark:text-purple-300 text-lg">🎭</span>
                </div>
                <span>Multiple Tones</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-400">
                Choose from Friendly, Formal, or Witty tones to match any situation perfectly.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold mb-8">Simple, Transparent Pricing</h3>
          <Card className="max-w-md mx-auto border-2 border-violet-200 dark:border-violet-800">
            <CardHeader>
              <CardTitle className="text-2xl">DM Decoder Pro</CardTitle>
              <CardDescription>Everything you need to master your messages</CardDescription>
              <div className="text-4xl font-bold text-violet-600">
                $5<span className="text-lg text-slate-500">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[
                  "Unlimited message analysis",
                  "AI-powered intent detection",
                  "Smart reply generation",
                  "Multiple tone options",
                  "Copy to clipboard",
                  "Mobile responsive"
                ].map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                onClick={() => setAuthModalOpen(true)}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default Index;
