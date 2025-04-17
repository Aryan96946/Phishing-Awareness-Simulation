import { useQuery } from "@tanstack/react-query";
import { Key, GraduationCap, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Activity {
  type: 'credentials_captured' | 'campaign_created' | 'link_clicked';
  timestamp: string;
  data: {
    campaign?: string;
    template?: string;
    user?: string;
    capturedAt?: string;
    createdAt?: string;
    clickedAt?: string;
  };
}

const RecentActivities = () => {
  const { toast } = useToast();
  
  const { data: activities = [], isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/stats/recent-activities']
  });

  const handleViewAll = () => {
    toast({
      title: "View All Activities",
      description: "This would navigate to the full activities log",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'credentials_captured':
        return (
          <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center ring-8 ring-white">
            <Key className="h-5 w-5 text-red-600" />
          </div>
        );
      case 'campaign_created':
        return (
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
            <GraduationCap className="h-5 w-5 text-green-600" />
          </div>
        );
      case 'link_clicked':
        return (
          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center ring-8 ring-white">
            <LinkIcon className="h-5 w-5 text-yellow-600" />
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
        );
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case 'credentials_captured':
        return 'Credentials Captured';
      case 'campaign_created':
        return 'Campaign Created';
      case 'link_clicked':
        return 'Link Clicked';
      default:
        return 'Activity';
    }
  };

  const getActivityTime = (activity: Activity) => {
    const timestamp = new Date(activity.timestamp);
    return timestamp.toLocaleString();
  };

  const getActivityDescription = (activity: Activity) => {
    switch (activity.type) {
      case 'credentials_captured':
        return `User ${activity.data.user} entered credentials in ${activity.data.campaign} campaign.`;
      case 'campaign_created':
        return `Admin user created a new campaign ${activity.data.campaign}.`;
      case 'link_clicked':
        return `User ${activity.data.user} clicked phishing link in ${activity.data.campaign} campaign.`;
      default:
        return 'Unknown activity occurred.';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Activities</h2>
          <Button variant="link" className="text-blue-600 hover:text-blue-800">
            View All
          </Button>
        </div>
        <div className="p-8 flex justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Recent Activities</h2>
        <Button variant="link" className="text-blue-600 hover:text-blue-800" onClick={handleViewAll}>
          View All
        </Button>
      </div>
      <div className="p-4">
        <div className="flow-root">
          {activities.length > 0 ? (
            <ul role="list" className="-mb-8">
              {activities.map((activity, index) => (
                <li key={index}>
                  <div className="relative pb-8">
                    {index < activities.length - 1 && (
                      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                    )}
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getActivityTitle(activity.type)}
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {getActivityTime(activity)}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>{getActivityDescription(activity)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No recent activities to display
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
