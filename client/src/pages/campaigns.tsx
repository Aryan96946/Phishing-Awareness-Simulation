import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Campaign } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CampaignTable from '@/components/dashboard/campaign-table';
import CampaignModal from '@/components/dashboard/campaign-modal';

const Campaigns = () => {
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns']
  });

  // Filter campaigns based on status
  const filteredCampaigns = campaigns.filter(campaign => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return campaign.status === 'active';
    if (activeTab === 'scheduled') return campaign.status === 'scheduled';
    if (activeTab === 'completed') return campaign.status === 'completed';
    if (activeTab === 'draft') return campaign.status === 'draft';
    return true;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Phishing Campaigns</h1>
        <Button 
          onClick={() => setIsNewCampaignModalOpen(true)}
          className="bg-primary hover:bg-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Campaign
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Target Group
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Template
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 whitespace-nowrap">
                          <div className="animate-pulse flex space-x-4">
                            <div className="flex-1 space-y-6 py-1">
                              <div className="h-4 bg-slate-200 rounded"></div>
                              <div className="space-y-3">
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="h-4 bg-slate-200 rounded col-span-2"></div>
                                  <div className="h-4 bg-slate-200 rounded col-span-1"></div>
                                </div>
                                <div className="h-4 bg-slate-200 rounded"></div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : filteredCampaigns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                          No campaigns found in this category
                        </td>
                      </tr>
                    ) : (
                      filteredCampaigns.map((campaign) => {
                        // Display campaign row (simplified for brevity, use CampaignTable for actual implementation)
                        const getStatusBadgeClass = (status: string) => {
                          switch (status) {
                            case 'active': return 'bg-green-100 text-green-800';
                            case 'completed': return 'bg-blue-100 text-blue-800';
                            case 'scheduled': return 'bg-yellow-100 text-yellow-800';
                            case 'paused': return 'bg-orange-100 text-orange-800';
                            default: return 'bg-gray-100 text-gray-800';
                          }
                        };

                        return (
                          <tr key={campaign.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(campaign.status)}`}>
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{campaign.targetGroup?.name || "Unknown"}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {campaign.template?.name || "Unknown"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className="bg-primary h-2.5 rounded-full" 
                                  style={{ width: `${campaign.progress || 0}%` }}
                                ></div>
                              </div>
                              <div className="text-xs mt-1 text-gray-500">{campaign.progress || 0}% Complete</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "Not set"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                >
                                  Edit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Other tab contents are similar, you can duplicate above content for each tab */}
        <TabsContent value="active" className="mt-0">
          <CampaignTable onNewCampaign={() => setIsNewCampaignModalOpen(true)} />
        </TabsContent>
        
        <TabsContent value="scheduled" className="mt-0">
          <CampaignTable onNewCampaign={() => setIsNewCampaignModalOpen(true)} />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-0">
          <CampaignTable onNewCampaign={() => setIsNewCampaignModalOpen(true)} />
        </TabsContent>
        
        <TabsContent value="draft" className="mt-0">
          <CampaignTable onNewCampaign={() => setIsNewCampaignModalOpen(true)} />
        </TabsContent>
      </Tabs>

      {/* New Campaign Modal */}
      <CampaignModal
        open={isNewCampaignModalOpen}
        setOpen={setIsNewCampaignModalOpen}
        onSuccess={() => {}}
      />
    </>
  );
};

export default Campaigns;
