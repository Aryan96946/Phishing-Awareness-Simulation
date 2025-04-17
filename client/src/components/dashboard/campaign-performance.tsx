import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CampaignStats {
  emailsSent: number;
  emailsOpened: number;
  linksClicked: number;
  credentialsEntered: number;
  emailOpenRate: number;
  linkClickRate: number;
  credentialsEnteredRate: number;
}

const CampaignPerformance = () => {
  const { data: stats, isLoading } = useQuery<CampaignStats>({
    queryKey: ['/api/stats/campaign-performance']
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Campaign Performance</h2>
        </div>
        <div className="p-4">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Campaign Performance</h2>
        </div>
        <div className="p-4">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
            <p className="text-gray-500">No data available</p>
          </div>
        </div>
      </div>
    );
  }

  // For the chart visualization
  const chartData = [
    {
      name: 'Emails Sent',
      value: stats.emailsSent,
      ratio: 100,
      color: '#2563eb'
    },
    {
      name: 'Opened',
      value: stats.emailsOpened,
      ratio: stats.emailOpenRate,
      color: '#4f46e5'
    },
    {
      name: 'Clicked Link',
      value: stats.linksClicked,
      ratio: stats.linkClickRate,
      color: '#eab308'
    },
    {
      name: 'Credentials Entered',
      value: stats.credentialsEntered,
      ratio: stats.credentialsEnteredRate,
      color: '#dc2626'
    }
  ];

  // For the simpler bar visualization
  const simpleBarData = [
    { name: 'Emails Sent', count: stats.emailsSent, percentage: '100%' },
    { name: 'Opened', count: stats.emailsOpened, percentage: `${stats.emailOpenRate.toFixed(1)}%` },
    { name: 'Clicked Link', count: stats.linksClicked, percentage: `${stats.linkClickRate.toFixed(1)}%` },
    { name: 'Credentials Entered', count: stats.credentialsEntered, percentage: `${stats.credentialsEnteredRate.toFixed(1)}%` },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Campaign Performance</h2>
      </div>
      <div className="p-4">
        <div className="h-64 bg-gray-50 rounded">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" />
              <Tooltip
                formatter={(value, name, props) => [`${value.toFixed(1)}%`, 'Success Rate']}
                labelFormatter={(label) => `${label} Stage`}
              />
              <Bar dataKey="ratio" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Simpler visualization for small screens */}
        <div className="mt-4 md:hidden">
          {simpleBarData.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">{item.name}</span>
                <span className="text-sm font-medium">{item.count} ({item.percentage})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className="h-2.5 rounded-full"
                  style={{
                    width: item.percentage,
                    backgroundColor: index === 0 ? '#2563eb' : 
                                    index === 1 ? '#4f46e5' :
                                    index === 2 ? '#eab308' : '#dc2626'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignPerformance;
