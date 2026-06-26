import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { UserPlus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import Swal from 'sweetalert2';

const formSchema = z.object({
  id: z.number().optional(),
  user_id: z.number().min(1, "Please select a user"),
  order: z.number().min(1, "Order must be at least 1"),
  is_email_send: z.boolean().default(true),
  comment: z.string().optional(),
  is_active: z.boolean().default(true),
  module_type: z.string()
});

interface UserRole {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  pivot: {
    model_id: number;
    role_id: number;
    model_type: string;
  };
}

interface ApproverUser {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
}

interface Approver {
  id: number;
  user_id: number;
  order: number;
  is_email_send: boolean;
  comment?: string;
  is_active: boolean;
  module_type: string;
  user?: {  // Make this optional
    id: number;
    name: string;
    email: string;
    roles: Array<{
      id: number;
      name: string;
      guard_name: string;
      created_at: string;
      updated_at: string;
      pivot: {
        model_id: number;
        role_id: number;
        model_type: string;
      };
    }>;
  };
}

interface UserOption {
  id: number;
  name: string;
  email: string;
  roles: UserRole[];
}

interface ApproversTabProps {
  moduleType: string;
  approvers: Approver[];
  setApprovers: React.Dispatch<React.SetStateAction<Approver[]>>;
  users: UserOption[];
}

const ApproversTab = ({ moduleType, approvers, setApprovers, users }: ApproversTabProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'add' | 'edit'>('add');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_id: 0,
      order: approvers.length > 0 ? Math.max(...approvers.map(a => a.order)) + 1 : 1,
      is_email_send: true,
      is_active: true,
      module_type: moduleType // Use the prop directly
    }
  });

  const formatRoles = (roles?: UserRole[]) => {
    if (!roles) return 'N/A';
    return roles.map(role => role.name).join(', ');
  };

  const handleDelete = async (id: number) => {
      const result = await Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
          try {
              await axios.delete(`/approval-flows/${id}`);
              setApprovers(approvers.filter(a => a.id !== id));
              toast.success('Approver removed successfully');
          } catch (error) {
              toast.error('Failed to remove approver');
          }
      }
  };

  const updateApproverStatus = async (id: number, is_active: boolean) => {
    try {
      await axios.put(`/approval-flows/${id}/status`, { is_active });
      setApprovers(approvers.map(a => a.id == id ? { ...a, is_active } : a));
      toast.success('Approver status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const orderExists = approvers.some(approver => 
        approver.order == values.order && 
        (!values.id || approver.id !== values.id)
      );

      if (orderExists) {
        toast.error('This order number is already assigned to another approver');
        return;
      }

      const url = values.id 
        ? `/approval-flows/${values.id}`
        : '/approval-flows';

      const response = await (values.id ? axios.put(url, values) : axios.post(url, values));
      
      // Get the updated/created approver from response
      const updatedApprover = response.data.approver || response.data;
      
      // Find the user details from the users list
      const user = users.find(u => u.id === updatedApprover.user_id);
      
      // Create the complete approver object
      const completeApprover = {
        ...updatedApprover,
        user: user || null
      };

      setApprovers(prev => 
        values.id 
          ? prev.map(a => a.id === values.id ? completeApprover : a)
          : [...prev, completeApprover]
      );

      setIsModalOpen(false);
      form.reset();
      toast.success(`Approver ${values.id ? 'updated' : 'added'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to save approver');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Approval Workflow
            <Button size="sm" onClick={() => {
              setCurrentAction('add');
              form.reset({
                user_id: 0,
                order: approvers.length > 0 ? Math.max(...approvers.map(a => a.order)) + 1 : 1,
                is_email_send: true,
                is_active: true,
                module_type: moduleType
              });
              setIsModalOpen(true);
            }}>
              <UserPlus className="mr-1 h-4 w-4" /> Add Approver
            </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {approvers.length == 0 ? (
          <div className="rounded-md border overflow-x-auto text-center py-10">
            <p className="text-gray-500 mb-4">No approvers found. Please add a new approver.</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Approver
            </Button>
          </div>
        ) : (
          <div className='rounded-md border overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Send Email</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...approvers].sort((a, b) => a.order - b.order).map(approver => (
                  <TableRow key={`approver-${approver.id}-${approver.user_id}`}>
                    <TableCell>{approver.order}</TableCell>
                    <TableCell>{approver.user?.name || 'N/A'}</TableCell>
                    <TableCell>{approver.user?.email || 'N/A'}</TableCell>
                    <TableCell>{approver.user ? formatRoles(approver.user.roles) : 'N/A'}</TableCell>
                    <TableCell>
                      <Switch
                        checked={approver.is_active}
                        onCheckedChange={(checked) => updateApproverStatus(approver.id, checked)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={approver.is_email_send}
                        disabled
                        className="data-[state=checked]:bg-blue-500"
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(approver.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) {
              form.reset({
                user_id: 0,
                order: approvers.length > 0 ? Math.max(...approvers.map(a => a.order)) + 1 : 1,
                is_email_send: true,
                is_active: true,
                module_type: moduleType
              });
            }
          }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{currentAction == 'edit' ? 'Edit Approver' : 'Add Approver'}</DialogTitle>
              <DialogDescription>
                {form.watch('id') ? 'Update the approver details' : 'Add a new approver to the workflow'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <input type="hidden" {...form.register('module_type')} />
                <FormField
                  control={form.control}
                  name="user_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select User</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                        disabled={!!form.watch('id')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              No users found
                            </div>
                          ) : (
                            users.map(user => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name} - {user.email}
                                <span className="text-xs text-muted-foreground">
                                  ({formatRoles(user.roles)})
                                </span>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approval Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_email_send"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Send Email Notification</FormLabel>
                        <p className='text-xs text-muted-foreground'>Send email when approval is required</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active</FormLabel>
                        <p className='text-xs text-muted-foreground'>Enable/disable this approver</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {form.watch('id') ? 'Update' : 'Add'} Approver
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ApproversTab;