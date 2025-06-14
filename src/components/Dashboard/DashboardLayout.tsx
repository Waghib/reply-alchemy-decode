
import { ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageHistory } from "@/components/MessageHistory";
import DashboardHeader from "./DashboardHeader";
import FreeUsageNotice from "./FreeUsageNotice";

interface DashboardLayoutProps {
  user: any;
  subscribed: boolean;
  freeUsageCount: number;
  loadingUsage: boolean;
  onSignOut: () => void;
  children: ReactNode;
}

const DashboardLayout = ({ 
  user, 
  subscribed, 
  freeUsageCount, 
  loadingUsage, 
  onSignOut, 
  children 
}: DashboardLayoutProps) => {
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader 
        user={user}
        subscribed={subscribed}
        freeUsageCount={freeUsageCount}
        loadingUsage={loadingUsage}
        onUpgrade={handleUpgrade}
        onSignOut={onSignOut}
      />

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        <FreeUsageNotice 
          subscribed={subscribed}
          freeUsageCount={freeUsageCount}
          onUpgrade={handleUpgrade}
        />

        <div className="mt-4 sm:mt-6">
          {children}
        </div>

        {/* Message History - Full Width Below */}
        {subscribed && (
          <div className="mt-6 sm:mt-8">
            <MessageHistory />
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardLayout;
