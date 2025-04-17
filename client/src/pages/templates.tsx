import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Template } from '@/types';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const templateSchema = z.object({
  name: z.string().min(3, { message: 'Template name must be at least 3 characters' }),
  subject: z.string().min(3, { message: 'Subject is required' }),
  body: z.string().min(10, { message: 'Email body is required' }),
  fromName: z.string().min(1, { message: 'From name is required' }),
  fromEmail: z.string().email({ message: 'Must be a valid email' }),
  type: z.string().min(1, { message: 'Type is required' }),
  landingPage: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

const Templates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<Template | null>(null);
  
  const { data: templates = [], isLoading } = useQuery<Template[]>({
    queryKey: ['/api/templates']
  });

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      subject: '',
      body: '',
      fromName: '',
      fromEmail: '',
      type: '',
      landingPage: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: TemplateFormValues) => {
      return apiRequest('POST', '/api/templates', values);
    },
    onSuccess: () => {
      toast({
        title: 'Template created',
        description: 'The template has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsModalOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create the template. Please try again.',
        variant: 'destructive',
      });
      console.error('Create template error:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (values: TemplateFormValues & { id: number }) => {
      const { id, ...template } = values;
      return apiRequest('PUT', `/api/templates/${id}`, template);
    },
    onSuccess: () => {
      toast({
        title: 'Template updated',
        description: 'The template has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
      setIsModalOpen(false);
      setEditingTemplate(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update the template. Please try again.',
        variant: 'destructive',
      });
      console.error('Update template error:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/templates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Template deleted',
        description: 'The template has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/templates'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete the template. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete template error:', error);
    }
  });

  const onSubmit = (values: TemplateFormValues) => {
    if (editingTemplate) {
      updateMutation.mutate({ ...values, id: editingTemplate.id });
    } else {
      createMutation.mutate(values);
    }
  };

  const openNewTemplateModal = () => {
    form.reset({
      name: '',
      subject: '',
      body: '',
      fromName: '',
      fromEmail: '',
      type: '',
      landingPage: '',
    });
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const openEditTemplateModal = (template: Template) => {
    form.reset({
      name: template.name,
      subject: template.subject,
      body: template.body,
      fromName: template.fromName,
      fromEmail: template.fromEmail,
      type: template.type,
      landingPage: template.landingPage || '',
    });
    setEditingTemplate(template);
    setIsModalOpen(true);
  };

  const openViewTemplateModal = (template: Template) => {
    setViewingTemplate(template);
  };

  // Helper to get template type icon/colors
  const getTemplateTypeDisplay = (type: string) => {
    switch (type) {
      case 'security':
        return { color: 'bg-red-100 text-red-600', icon: '🔒' };
      case 'finance':
        return { color: 'bg-purple-100 text-purple-600', icon: '💰' };
      case 'it':
        return { color: 'bg-blue-100 text-primary', icon: '💻' };
      default:
        return { color: 'bg-gray-100 text-gray-600', icon: '📧' };
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Email Templates</h1>
        <Button 
          onClick={openNewTemplateModal}
          className="bg-primary hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="shadow animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-24 bg-slate-200 rounded mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </CardContent>
              <CardFooter>
                <div className="h-8 bg-slate-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const typeDisplay = getTemplateTypeDisplay(template.type);
            
            return (
              <Card key={template.id} className="shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription className="mt-1">Type: {template.type}</CardDescription>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-sm ${typeDisplay.color}`}>
                      {typeDisplay.icon}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-500">Subject:</p>
                    <p className="text-sm">{template.subject}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-500">From:</p>
                    <p className="text-sm">{template.fromName} &lt;{template.fromEmail}&gt;</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Preview:</p>
                    <div className="text-sm bg-gray-50 p-2 rounded mt-1 max-h-20 overflow-hidden">
                      {template.body && template.body.length > 100 
                        ? `${template.body.substring(0, 100)}...` 
                        : template.body}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-blue-600"
                    onClick={() => openViewTemplateModal(template)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => openEditTemplateModal(template)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this template? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => deleteMutation.mutate(template.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            );
          })}

          {templates.length === 0 && (
            <div className="col-span-full text-center p-12 bg-white rounded-lg shadow">
              <div className="text-gray-500 mb-2">No templates found</div>
              <Button 
                onClick={openNewTemplateModal}
                className="bg-primary hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create your first template
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Template Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? 'Update your phishing email template details.' 
                : 'Create a new phishing email template for your campaigns.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter template name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="it">IT</SelectItem>
                          <SelectItem value="general">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Sender's display name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="fromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Email</FormLabel>
                      <FormControl>
                        <Input placeholder="sender@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Body (HTML)</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={8}
                        placeholder="Enter email body HTML. Use {{name}} for recipient name and {{phishingUrl}} for the phishing link."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="landingPage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Landing Page (HTML)</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={6}
                        placeholder="Enter landing page HTML. Use {{captureUrl}} for the credential capture endpoint."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                  ) : editingTemplate ? "Update Template" : "Create Template"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Template Modal */}
      {viewingTemplate && (
        <Dialog open={!!viewingTemplate} onOpenChange={() => setViewingTemplate(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Template: {viewingTemplate.name}</DialogTitle>
              <DialogDescription>
                Template details and preview
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Type:</p>
                  <p>{viewingTemplate.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">From:</p>
                  <p>{viewingTemplate.fromName} &lt;{viewingTemplate.fromEmail}&gt;</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Subject:</p>
                <p>{viewingTemplate.subject}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-500">Email Body:</p>
                <div className="bg-gray-50 p-4 rounded border mt-1 max-h-60 overflow-auto">
                  <div dangerouslySetInnerHTML={{ __html: viewingTemplate.body }} />
                </div>
              </div>
              
              {viewingTemplate.landingPage && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Landing Page:</p>
                  <div className="bg-gray-50 p-4 rounded border mt-1 max-h-60 overflow-auto">
                    <div dangerouslySetInnerHTML={{ __html: viewingTemplate.landingPage }} />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                onClick={() => setViewingTemplate(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Templates;
