import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SendHorizonal, Users, BarChart3, GraduationCap } from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import CampaignTable from '@/components/dashboard/campaign-table';
import CampaignPerformance from '@/components/dashboard/campaign-performance';
import EffectiveTemplates from '@/components/dashboard/effective-templates';
import RecentActivities from '@/components/dashboard/recent-activities';
import CampaignModal from '@/components/dashboard/campaign-modal';

interface DashboardStats {
  activeCampaignCount: number;
  templateCount: number;
  phishingSuccessRate: number;
  awarenessTrainingRate: number;
  mostEffectiveTemplates: Array<{
    templateId: number;
    name: string;
    successRate: number;
  }>;
  recentActivities: Array<any>;
}

const Dashboard = () => {
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/stats/dashboard']
  });

  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Active Campaigns"
          value={isLoading ? '-' : stats?.activeCampaignCount || 0}
          icon={<SendHorizonal className="h-6 w-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-primary"
          trend={{
            value: "+2",
            isPositive: true,
            label: "from last month"
          }}
        />
        <StatCard
          title="Phishing Success Rate"
          value={isLoading ? '-' : `${stats?.phishingSuccessRate || 0}%`}
          icon={<BarChart3 className="h-6 w-6" />}
          iconBgColor="bg-yellow-100"
          iconColor="text-yellow-500"
          trend={{
            value: "-3.2%",
            isPositive: false,
            label: "from baseline"
          }}
        />
        <StatCard
          title="Total Templates"
          value={isLoading ? '-' : stats?.templateCount || 0}
          icon={<SendHorizonal className="h-6 w-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          trend={{
            value: "+5",
            isPositive: true,
            label: "new this month"
          }}
        />
        <StatCard
          title="Awareness Training"
          value={isLoading ? '-' : `${stats?.awarenessTrainingRate || 0}%`}
          icon={<GraduationCap className="h-6 w-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-success"
          trend={{
            value: "+12%",
            isPositive: true,
            label: "completion rate"
          }}
        />
      </div>

      {/* Active Campaigns Section */}
      <CampaignTable onNewCampaign={() => setIsNewCampaignModalOpen(true)} />

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-6">
        <CampaignPerformance />
        <EffectiveTemplates />
      </div>

      {/* Recent Activities Section */}
      <RecentActivities />

      {/* New Campaign Modal */}
      <CampaignModal
        open={isNewCampaignModalOpen}
        setOpen={setIsNewCampaignModalOpen}
        onSuccess={() => {}}
      />
    </>
  );
};

export default Dashboard;
