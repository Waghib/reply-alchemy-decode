
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsageManagement } from "@/components/Dashboard/UsageManagement";
import DashboardLayout from "@/components/Dashboard/DashboardLayout";
import AnalysisSection from "@/components/Dashboard/AnalysisSection";

const Dashboard = () => {
  const { user, signOut, subscribed } = useAuth();
  const [freeUsageCount, setFreeUsageCount] = useState(0);
  const [loadingUsage, setLoadingUsage] = useState(true);

  const handleUsageUpdate = (count: number, loading: boolean) => {
    setFreeUsageCount(count);
    setLoadingUsage(loading);
  };

  const { checkUsageLimit, handleDemoUsage } = useUsageManagement({
    user,
    subscribed,
    onUsageUpdate: handleUsageUpdate
  });

  return (
    <DashboardLayout
      user={user}
      subscribed={subscribed}
      freeUsageCount={freeUsageCount}
      loadingUsage={loadingUsage}
      onSignOut={signOut}
    >
      <AnalysisSection
        user={user}
        subscribed={subscribed}
        freeUsageCount={freeUsageCount}
        loadingUsage={loadingUsage}
        onDemoUsage={handleDemoUsage}
        checkUsageLimit={checkUsageLimit}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
