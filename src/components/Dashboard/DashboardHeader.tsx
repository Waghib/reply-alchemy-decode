
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
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
              <MessageSquare className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                DM Decoder
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                Welcome back, {user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {subscribed ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs">
                <Crown className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                Pro
              </Badge>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Badge variant="outline" className="text-xs hidden sm:inline-flex">
                  {loadingUsage ? "Loading..." : `Free: ${freeUsageCount}/${FREE_USAGE_LIMIT} used`}
                </Badge>
                <Button onClick={onUpgrade} size="sm" className="text-xs sm:text-sm h-8 sm:h-9">
                  <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Upgrade to Pro</span>
                  <span className="sm:hidden">Pro</span>
                </Button>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={onSignOut} className="text-xs sm:text-sm h-8 sm:h-9">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
