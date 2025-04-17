import { useQuery } from "@tanstack/react-query";
import { Eye, AlertTriangle, Mail, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TemplateSuccessRate {
  templateId: number;
  name: string;
  successRate: number;
}

const EffectiveTemplates = () => {
  const { toast } = useToast();
  
  const { data: templates = [], isLoading } = useQuery<TemplateSuccessRate[]>({
    queryKey: ['/api/templates/stats/success-rates']
  });

  const handleViewTemplate = (templateId: number) => {
    toast({
      title: "View Template",
      description: `Viewing template ID: ${templateId}`,
    });
  };

  // Helper to get the appropriate icon for the template
  const getTemplateIcon = (templateName: string) => {
    if (templateName.toLowerCase().includes('security')) {
      return <AlertTriangle className="h-6 w-6" />;
    } else if (templateName.toLowerCase().includes('accounting') || templateName.toLowerCase().includes('invoice')) {
      return <Mail className="h-6 w-6" />;
    } else if (templateName.toLowerCase().includes('password') || templateName.toLowerCase().includes('it')) {
      return <LockKeyhole className="h-6 w-6" />;
    } else {
      return <Mail className="h-6 w-6" />;
    }
  };

  // Helper to get appropriate background color
  const getIconBgClass = (templateName: string) => {
    if (templateName.toLowerCase().includes('security')) {
      return 'bg-red-100 text-red-600';
    } else if (templateName.toLowerCase().includes('accounting') || templateName.toLowerCase().includes('invoice')) {
      return 'bg-purple-100 text-purple-600';
    } else if (templateName.toLowerCase().includes('password') || templateName.toLowerCase().includes('it')) {
      return 'bg-blue-100 text-primary';
    } else {
      return 'bg-green-100 text-green-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Most Effective Templates</h2>
        </div>
        <div className="p-4">
          <div className="flex justify-center p-8">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Most Effective Templates</h2>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {templates.length > 0 ? (
            templates.slice(0, 3).map((template) => (
              <div key={template.templateId} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className={`flex-shrink-0 h-10 w-10 flex items-center justify-center ${getIconBgClass(template.name)} rounded-lg mr-4`}>
                  {getTemplateIcon(template.name)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{template.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="text-xs text-gray-500">Success rate:</div>
                    <div className="text-sm font-medium text-danger">{template.successRate}%</div>
                  </div>
                </div>
                <div className="ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-blue-600 hover:text-blue-900 hover:bg-blue-50"
                    onClick={() => handleViewTemplate(template.templateId)}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No template data available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EffectiveTemplates;
