
import { Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FreeUsageNoticeProps {
  subscribed: boolean;
  freeUsageCount: number;
  onUpgrade: () => void;
}

const FreeUsageNotice = ({ subscribed, freeUsageCount, onUpgrade }: FreeUsageNoticeProps) => {
  const FREE_USAGE_LIMIT = 3;

  if (subscribed) return null;

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-orange-800 dark:text-orange-300 text-sm">
              {freeUsageCount >= FREE_USAGE_LIMIT ? "Free limit reached!" : "Free Demo Mode"}
            </h3>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              {freeUsageCount >= FREE_USAGE_LIMIT 
                ? "Upgrade to Pro for unlimited AI-powered analysis" 
                : `${FREE_USAGE_LIMIT - freeUsageCount} demo analyses remaining. Pro users get unlimited AI-powered results!`
              }
            </p>
          </div>
          <Button onClick={onUpgrade} size="sm">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FreeUsageNotice;
