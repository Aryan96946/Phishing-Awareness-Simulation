import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Campaign } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Download, Mail, User, Link, Key, GraduationCap } from 'lucide-react';

interface CampaignData {
  id: number;
  emailsSent: number;
  emailsOpened: number;
  linksClicked: number;
  credentialsEntered: number;
  trainingCompleted: number;
}

const Reports = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('all');
  
  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<Campaign[]>({
    queryKey: ['/api/campaigns']
  });

  const { data: campaignStats = null, isLoading: statsLoading } = useQuery<CampaignData>({
    queryKey: ['/api/stats/campaign-performance'],
    enabled: selectedCampaignId !== 'all',
  });

  // Sample data for charts - in a real app, this would come from the API
  const overallPerformanceData = [
    {
      name: 'Emails Sent',
      value: campaignStats?.emailsSent || 375,
      icon: <Mail className="h-4 w-4" />,
    },
    {
      name: 'Opened',
      value: campaignStats?.emailsOpened || 247,
      percentage: 65.9,
      icon: <User className="h-4 w-4" />,
    },
    {
      name: 'Clicked Link',
      value: campaignStats?.linksClicked || 142,
      percentage: 37.9,
      icon: <Link className="h-4 w-4" />,
    },
    {
      name: 'Credentials Entered',
      value: campaignStats?.credentialsEntered || 93,
      percentage: 24.8,
      icon: <Key className="h-4 w-4" />,
    },
    {
      name: 'Training Completed',
      value: campaignStats?.trainingCompleted || 78,
      percentage: 20.8,
      icon: <GraduationCap className="h-4 w-4" />,
    },
  ];

  const departmentData = [
    { name: 'IT', value: 15.2 },
    { name: 'Finance', value: 32.8 },
    { name: 'Executive', value: 24.1 },
    { name: 'HR', value: 18.7 },
    { name: 'Marketing', value: 28.4 },
  ];

  const monthlyTrendData = [
    { name: 'Jan', success: 22.4 },
    { name: 'Feb', success: 26.1 },
    { name: 'Mar', success: 24.8 },
    { name: 'Apr', success: 22.3 },
    { name: 'May', success: 20.1 },
    { name: 'Jun', success: 18.9 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Helper function to handle exporting reports
  const handleExportReport = () => {
    // This would generate and download a report in a real app
    alert('This would download a report in CSV or PDF format in a real implementation');
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <Select 
            value={selectedCampaignId} 
            onValueChange={setSelectedCampaignId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              {campaigns.map((campaign) => (
                <SelectItem key={campaign.id} value={campaign.id.toString()}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedTimeframe}
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportReport}
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="departments">By Department</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campaign Funnel */}
            <Card className="shadow">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Overall funnel analysis of user interactions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={overallPerformanceData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip 
                        formatter={(value, name, props) => [value, 'Count']}
                      />
                      <Bar dataKey="value" fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Simpler visualization */}
                <div className="mt-4 space-y-4">
                  {overallPerformanceData.map((item, index) => (
                    <div key={index} className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 flex items-center">
                          {item.icon}
                          <span className="ml-2">{item.name}</span>
                        </span>
                        <span className="text-sm font-medium">
                          {item.value} {item.percentage ? `(${item.percentage}%)` : ''}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-primary"
                          style={{ width: item.percentage ? `${item.percentage}%` : '100%' }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Success by Department */}
            <Card className="shadow">
              <CardHeader>
                <CardTitle>Success Rate by Department</CardTitle>
                <CardDescription>Which departments are most susceptible to phishing</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Monthly Trends */}
            <Card className="shadow md:col-span-2">
              <CardHeader>
                <CardTitle>Success Rate Trends</CardTitle>
                <CardDescription>Monthly trend of phishing success rates</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthlyTrendData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="success" 
                        name="Success Rate" 
                        stroke="#2563eb" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="detailed">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>Detailed Campaign Analysis</CardTitle>
              <CardDescription>Comprehensive breakdown of campaign performance</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-gray-500">
                Detailed analysis would be implemented here with expanded metrics and exportable reports
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>Department Analysis</CardTitle>
              <CardDescription>Phishing susceptibility by department</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-gray-500">
                Department-specific analysis would be implemented here with breakdown by team
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>Time-based Trends</CardTitle>
              <CardDescription>Performance trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-gray-500">
                Trend analysis would be implemented here with historical data visualization
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Reports;
