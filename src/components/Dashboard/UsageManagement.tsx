
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UsageManagementProps {
  user: any;
  subscribed: boolean;
  onUsageUpdate: (count: number, loading: boolean) => void;
}

export const useUsageManagement = ({ user, subscribed, onUsageUpdate }: UsageManagementProps) => {
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const { toast } = useToast();

  const FREE_USAGE_LIMIT = 3;

  // Load free usage count from database
  useEffect(() => {
    const loadFreeUsage = async () => {
      if (!user || subscribed) {
        setLoadingUsage(false);
        onUsageUpdate(0, false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('free_usage_tracking')
          .select('usage_count')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading free usage:', error);
          return;
        }

        const count = data?.usage_count || 0;
        setFreeUsageCount(count);
        onUsageUpdate(count, false);
      } catch (error) {
        console.error('Error loading free usage:', error);
        onUsageUpdate(0, false);
      } finally {
        setLoadingUsage(false);
      }
    };

    loadFreeUsage();
  }, [user, subscribed, onUsageUpdate]);

  const updateFreeUsageCount = async (newCount: number) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('free_usage_tracking')
        .upsert({
          user_id: user.id,
          usage_count: newCount,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating free usage:', error);
        return false;
      }

      setFreeUsageCount(newCount);
      onUsageUpdate(newCount, false);
      return true;
    } catch (error) {
      console.error('Error updating free usage:', error);
      return false;
    }
  };

  const checkUsageLimit = () => {
    if (!subscribed && freeUsageCount >= FREE_USAGE_LIMIT) {
      toast({
        title: "Free Limit Reached",
        description: `You've used all ${FREE_USAGE_LIMIT} free analyses. Upgrade to Pro for unlimited usage.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDemoUsage = async () => {
    const newCount = freeUsageCount + 1;
    const updateSuccess = await updateFreeUsageCount(newCount);
    
    if (updateSuccess) {
      const remainingAnalyses = FREE_USAGE_LIMIT - newCount;
      toast({
        title: "Demo Analysis Complete",
        description: remainingAnalyses > 0 
          ? `${remainingAnalyses} free analyses remaining. Upgrade for full AI features!`
          : "You've used all your free analyses. Upgrade to Pro for unlimited AI-powered results!",
      });
    } else {
      toast({
        title: "Demo Analysis Complete",
        description: "Note: Unable to update usage count. Please refresh and try again.",
        variant: "destructive",
      });
    }
  };

  return {
    freeUsageCount,
    loadingUsage,
    checkUsageLimit,
    handleDemoUsage,
    FREE_USAGE_LIMIT
  };
};
