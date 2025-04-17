import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TargetGroup, TargetUser } from '@/types';
import { Plus, Users, UserPlus, User, Edit, Trash2, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const targetGroupSchema = z.object({
  name: z.string().min(3, { message: 'Group name must be at least 3 characters' }),
  description: z.string().optional(),
});

const targetUserSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  email: z.string().email({ message: 'Must be a valid email' }),
  department: z.string().optional(),
  groupId: z.number(),
});

type TargetGroupFormValues = z.infer<typeof targetGroupSchema>;
type TargetUserFormValues = z.infer<typeof targetUserSchema>;

const TargetGroups = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TargetGroup | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(null);
  
  const { data: groups = [], isLoading: groupsLoading } = useQuery<TargetGroup[]>({
    queryKey: ['/api/target-groups']
  });

  const { data: groupUsers = [], isLoading: usersLoading } = useQuery<TargetUser[]>({
    queryKey: ['/api/target-groups', activeGroupId, 'users'],
    enabled: !!activeGroupId,
  });

  const groupForm = useForm<TargetGroupFormValues>({
    resolver: zodResolver(targetGroupSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const userForm = useForm<TargetUserFormValues>({
    resolver: zodResolver(targetUserSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      groupId: 0,
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: async (values: TargetGroupFormValues) => {
      return apiRequest('POST', '/api/target-groups', values);
    },
    onSuccess: () => {
      toast({
        title: 'Group created',
        description: 'The target group has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/target-groups'] });
      setIsGroupModalOpen(false);
      groupForm.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create the target group. Please try again.',
        variant: 'destructive',
      });
      console.error('Create group error:', error);
    }
  });

  const updateGroupMutation = useMutation({
    mutationFn: async (values: TargetGroupFormValues & { id: number }) => {
      const { id, ...group } = values;
      return apiRequest('PUT', `/api/target-groups/${id}`, group);
    },
    onSuccess: () => {
      toast({
        title: 'Group updated',
        description: 'The target group has been updated successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/target-groups'] });
      setIsGroupModalOpen(false);
      setSelectedGroup(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update the target group. Please try again.',
        variant: 'destructive',
      });
      console.error('Update group error:', error);
    }
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/target-groups/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Group deleted',
        description: 'The target group has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/target-groups'] });
      if (activeGroupId) {
        setActiveGroupId(null);
      }
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete the target group. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete group error:', error);
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async (values: TargetUserFormValues) => {
      return apiRequest('POST', '/api/target-users', values);
    },
    onSuccess: () => {
      toast({
        title: 'User added',
        description: 'The user has been added to the target group successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/target-groups', activeGroupId, 'users'] });
      setIsUserModalOpen(false);
      userForm.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add the user. Please try again.',
        variant: 'destructive',
      });
      console.error('Create user error:', error);
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/target-users/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'User removed',
        description: 'The user has been removed from the target group.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/target-groups', activeGroupId, 'users'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to remove the user. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete user error:', error);
    }
  });

  const onGroupSubmit = (values: TargetGroupFormValues) => {
    if (selectedGroup) {
      updateGroupMutation.mutate({ ...values, id: selectedGroup.id });
    } else {
      createGroupMutation.mutate(values);
    }
  };

  const onUserSubmit = (values: TargetUserFormValues) => {
    createUserMutation.mutate(values);
  };

  const openNewGroupModal = () => {
    groupForm.reset({
      name: '',
      description: '',
    });
    setSelectedGroup(null);
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (group: TargetGroup) => {
    groupForm.reset({
      name: group.name,
      description: group.description || '',
    });
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  };

  const openAddUserModal = (groupId: number) => {
    userForm.reset({
      name: '',
      email: '',
      department: '',
      groupId: groupId,
    });
    setIsUserModalOpen(true);
  };

  const handleGroupSelect = (groupId: number) => {
    setActiveGroupId(groupId);
  };

  // Function to handle bulk user import (placeholder for now)
  const handleImportUsers = () => {
    toast({
      title: 'Import Users',
      description: 'This would open a CSV import interface',
    });
  };

  // Function to handle user export (placeholder for now)
  const handleExportUsers = () => {
    toast({
      title: 'Export Users',
      description: 'This would export users to CSV',
    });
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Target Groups</h1>
        <Button 
          onClick={openNewGroupModal}
          className="bg-primary hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Group
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar - Groups list */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Groups
            </h2>
            
            {groupsLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupSelect(group.id)}
                    className={`w-full text-left p-3 rounded-md flex justify-between items-center ${
                      activeGroupId === group.id 
                        ? 'bg-blue-50 border-l-4 border-primary' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-gray-500">{group.userCount || 0} users</div>
                    </div>
                  </button>
                ))}
                
                {groups.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No groups found</p>
                    <Button
                      onClick={openNewGroupModal}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Create Group
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right content - Group details and users */}
        <div className="lg:col-span-3">
          {activeGroupId ? (
            <Card className="shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>
                      {groups.find(g => g.id === activeGroupId)?.name || 'Group Details'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {groups.find(g => g.id === activeGroupId)?.description || 'No description provided'}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditGroupModal(groups.find(g => g.id === activeGroupId)!)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Group
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Group
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Target Group</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this target group? This will also remove all users in this group and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => deleteGroupMutation.mutate(activeGroupId)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Users management toolbar */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium">Targets ({groupUsers.length})</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleImportUsers}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Import
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleExportUsers}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => openAddUserModal(activeGroupId)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add User
                    </Button>
                  </div>
                </div>
                
                {/* Users list */}
                {usersLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 bg-slate-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {groupUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.department || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Remove
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove User</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this user from the target group?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => deleteUserMutation.mutate(user.id)}
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          </tr>
                        ))}
                        
                        {groupUsers.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                              <p className="mb-2">No users in this group yet</p>
                              <Button 
                                size="sm"
                                onClick={() => openAddUserModal(activeGroupId)}
                              >
                                <UserPlus className="h-4 w-4 mr-1" />
                                Add User
                              </Button>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Target Group Selected</h3>
              <p className="text-gray-500 mb-6">Select a target group from the list or create a new one to manage its users.</p>
              <Button 
                onClick={openNewGroupModal}
                className="bg-primary hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create New Group
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Group Modal */}
      <Dialog open={isGroupModalOpen} onOpenChange={setIsGroupModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{selectedGroup ? 'Edit Target Group' : 'Create New Target Group'}</DialogTitle>
            <DialogDescription>
              {selectedGroup 
                ? 'Update your target group details.' 
                : 'Create a new group of users for your phishing campaigns.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...groupForm}>
            <form onSubmit={groupForm.handleSubmit(onGroupSubmit)} className="space-y-4">
              <FormField
                control={groupForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter group name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={groupForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter group description"
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
                  disabled={createGroupMutation.isPending || updateGroupMutation.isPending}
                >
                  {createGroupMutation.isPending || updateGroupMutation.isPending ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : selectedGroup ? "Update Group" : "Create Group"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add User to Target Group</DialogTitle>
            <DialogDescription>
              Add a new user to the selected target group.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...userForm}>
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <FormField
                control={userForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john.smith@company.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={userForm.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Finance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-blue-700"
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : "Add User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TargetGroups;
