
import { MessageSquare, Crown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  user: any;
  subscribed: boolean;
  freeUsageCount: number;
  loadingUsage: boolean;
  onUpgrade: () => void;
  onSignOut: () => void;
}

const DashboardHeader = ({ 
  user, 
  subscribed, 
  freeUsageCount, 
  loadingUsage, 
  onUpgrade, 
  onSignOut 
}: DashboardHeaderProps) => {
  const FREE_USAGE_LIMIT = 3;

  return (
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
                  {loadingUsage ? "Loading..." : `Free: ${freeUsageCount}/${FREE_USAGE_LIMIT} used`}
                </Badge>
                <Button onClick={onUpgrade} size="sm">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
