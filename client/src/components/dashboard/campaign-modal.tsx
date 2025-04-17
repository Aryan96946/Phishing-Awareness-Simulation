import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@/types";

interface CampaignModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess: () => void;
  campaign?: Campaign;
}

const formSchema = z.object({
  name: z.string().min(3, { message: "Campaign name must be at least 3 characters" }),
  description: z.string().optional(),
  templateId: z.string().refine(val => !isNaN(parseInt(val)), { message: "Please select a template" }),
  targetGroupId: z.string().refine(val => !isNaN(parseInt(val)), { message: "Please select a target group" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  status: z.string().optional()
});

const CampaignModal = ({ open, setOpen, onSuccess, campaign }: CampaignModalProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [] } = useQuery({
    queryKey: ['/api/templates']
  });

  const { data: targetGroups = [] } = useQuery({
    queryKey: ['/api/target-groups']
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: campaign?.name || "",
      description: campaign?.description || "",
      templateId: campaign?.templateId.toString() || "",
      targetGroupId: campaign?.targetGroupId.toString() || "",
      startDate: campaign?.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: campaign?.status || "draft"
    }
  });

  useEffect(() => {
    if (campaign) {
      form.reset({
        name: campaign.name,
        description: campaign.description || "",
        templateId: campaign.templateId.toString(),
        targetGroupId: campaign.targetGroupId.toString(),
        startDate: campaign.startDate ? new Date(campaign.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: campaign.status
      });
    } else {
      form.reset({
        name: "",
        description: "",
        templateId: "",
        targetGroupId: "",
        startDate: new Date().toISOString().split('T')[0],
        status: "draft"
      });
    }
  }, [campaign, form]);

  const createMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        ...values,
        templateId: parseInt(values.templateId),
        targetGroupId: parseInt(values.targetGroupId),
        startDate: new Date(values.startDate).toISOString(),
        status: values.status || "draft"
      };
      
      return apiRequest('POST', '/api/campaigns', payload);
    },
    onSuccess: () => {
      toast({
        title: "Campaign created",
        description: "The campaign has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create the campaign. Please try again.",
        variant: "destructive",
      });
      console.error("Create campaign error:", error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const payload = {
        ...values,
        templateId: parseInt(values.templateId),
        targetGroupId: parseInt(values.targetGroupId),
        startDate: new Date(values.startDate).toISOString(),
        status: values.status
      };
      
      return apiRequest('PUT', `/api/campaigns/${campaign?.id}`, payload);
    },
    onSuccess: () => {
      toast({
        title: "Campaign updated",
        description: "The campaign has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      setOpen(false);
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update the campaign. Please try again.",
        variant: "destructive",
      });
      console.error("Update campaign error:", error);
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (campaign) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{campaign ? "Edit Campaign" : "Create New Campaign"}</DialogTitle>
          <DialogDescription>
            {campaign
              ? "Update the details of your phishing simulation campaign."
              : "Configure a new phishing simulation campaign to test your users."
            }
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter campaign name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Campaign description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetGroupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Group</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {targetGroups.map((group) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            {group.name} ({group.userCount || 0} users)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Template</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {campaign && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-blue-700"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : campaign ? "Update Campaign" : "Create Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignModal;
