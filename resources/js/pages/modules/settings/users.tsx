'use client';

import { useForm, usePage, router, Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { User, UserCheck, Pencil, ChevronUp, ChevronDown, Plus, Settings, Eye, Play, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import InputError from '@/components/input-error';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appearance settings',
        href: '/settings/appearance',
    },
];

interface Role {
    id: number;
    name: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    status: boolean;
    is_login: boolean;
    created_at: string;
    roles: Role[];
}

interface PaginatedUsers {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export default function UserManagement() {
    const { users: initialUsers, roles } = usePage().props as any;
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [open, setOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [users, setUsers] = useState<PaginatedUsers>(initialUsers);

    const { data, setData, patch, processing, errors, reset } = useForm({
        name: '',
        role_id: '',
        status: '',
        is_login: '',
    });

    const openEdit = (user: User) => {
        setEditingUser(user);
        setData({
            name: user.name,
            status: user.status,
            role_id: user.roles[0]?.id.toString() || ''
        });
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            patch(route('users.update', editingUser.id), {
                preserveScroll: true,
                onSuccess: () => {
                    const updatedData = users.data.map(u => 
                        u.id === editingUser.id ? { 
                            ...u, 
                            name: data.name,
                            status: data.status === '1',
                            roles: roles.filter(r => r.id.toString() === data.role_id).length > 0 
                                ? [{ id: parseInt(data.role_id), name: roles.find(r => r.id.toString() === data.role_id)?.name || '' }] 
                                : []
                        } : u
                    );
                    setUsers({...users, data: updatedData});
                    
                    setOpen(false);
                    toast.success('User updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update user');
                }
            });
        }
    };

    const toggleStatus = async (user: User) => {
        const newStatus = !user.is_login;
        const actionText = newStatus ? 'activate' : 'deactivate';

        const result = await Swal.fire({
            title: 'Change User Status?',
            text: `Are you sure you want to ${actionText} this user?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, ${actionText}`
        });

        if (result.isConfirmed) {
            router.patch(route('users.toggle-status', user.id), 
                { is_login: newStatus ? 1 : 0 },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Update the local state to reflect the change
                        const updatedData = users.data.map(u => 
                            u.id === user.id ? {...u, is_login: newStatus} : u
                        );
                        setUsers({...users, data: updatedData});

                        toast.success(`User ${actionText}d successfully`);
                    },
                    onError: () => {
                        toast.error(`Failed to ${actionText} user`);
                    }
                }
            );
        }
    };

    const toggleSort = (column: 'name' | 'email' | 'created_at') => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const filteredData = useMemo(() => {
        if (!users?.data || !Array.isArray(users.data)) {
            return [];
        }
        return users.data
            .filter((user: User) => {
                const matchesSearch = 
                    user.name.toLowerCase().includes(search.toLowerCase()) ||
                    user.email.toLowerCase().includes(search.toLowerCase());
                
                const matchesStatus = 
                    statusFilter === 'All' ||
                    (statusFilter === 'Active' && user.is_login) ||
                    (statusFilter === 'Inactive' && !user.is_login);
                
                return matchesSearch && matchesStatus;
            })
            .sort((a: User, b: User) => {
                const valA = a[sortBy];
                const valB = b[sortBy];

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [users.data, search, sortBy, sortDirection, statusFilter]);

    return (
         <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
                    <HeadingSmall title="User Management" description="Update user management settings" />

                    <div className="flex justify-between items-center">
                        <div>
                            <CardDescription>
                                Showing {filteredData.length} of {users.total} users
                            </CardDescription>
                        </div>
                        <div className="flex space-x-2">
                            <Input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64"
                            />
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Statuses</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Card className='shadow-none py-0 rounded-md'>
                        <CardContent className='p-0 '>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead onClick={() => toggleSort('name')} className="cursor-pointer">
                                            <div className="flex items-center">
                                                Name 
                                                {sortBy === 'name' && (sortDirection === 'asc' ? 
                                                    <ChevronUp className="ml-1 h-4 w-4" /> : 
                                                    <ChevronDown className="ml-1 h-4 w-4" />)}
                                            </div>
                                        </TableHead>
                                        <TableHead onClick={() => toggleSort('email')} className="cursor-pointer">
                                            <div className="flex items-center">
                                                Email 
                                                {sortBy === 'email' && (sortDirection === 'asc' ? 
                                                    <ChevronUp className="ml-1 h-4 w-4" /> : 
                                                    <ChevronDown className="ml-1 h-4 w-4" />)}
                                            </div>
                                        </TableHead>
                                        <TableHead>Designation</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Is Login?</TableHead>
                                        <TableHead onClick={() => toggleSort('created_at')} className="cursor-pointer">
                                            <div className="flex items-center">
                                                Created At 
                                                {sortBy === 'created_at' && (sortDirection === 'asc' ? 
                                                    <ChevronUp className="ml-1 h-4 w-4" /> : 
                                                    <ChevronDown className="ml-1 h-4 w-4" />)}
                                            </div>
                                        </TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((user: User) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {user.roles[0]?.name || 'No role assigned'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.status ? 'default' : 'destructive'}>
                                                    {user.status ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={user.is_login}
                                                    onCheckedChange={() => toggleStatus(user)}
                                                    className="data-[state=checked]:bg-green-500"
                                                />
                                            </TableCell>
                                            <TableCell>{format(new Date(user.created_at), 'yyyy-MM-dd')}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm"
                                                                onClick={() => openEdit(user)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit User</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link>
                                                                    <Eye className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>View Details</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            
                            {/* Pagination */}
                            {users.last_page > 1 && (
                                <div className="mt-4">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious 
                                                    href={users.current_page > 1 ? users.links[0].url || '#' : '#'}
                                                    className={users.current_page === 1 ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>
                                            
                                            {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                                <PaginationItem key={page}>
                                                    <PaginationLink
                                                        href={`?page=${page}`}
                                                        isActive={page === users.current_page}
                                                    >
                                                        {page}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            
                                            <PaginationItem>
                                                <PaginationNext 
                                                    href={users.current_page < users.last_page ? users.links[users.links.length - 1].url || '#' : '#'}
                                                    className={users.current_page === users.last_page ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit User Dialog */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input 
                                        id="name" 
                                        value={data.name} 
                                        onChange={(e) => setData('name', e.target.value)} 
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="role">Designation</Label>
                                    <Select 
                                        value={data.role_id} 
                                        onValueChange={(value) => setData('role_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                    No designations found
                                                </div>
                                            ) : (
                                                roles.map((role: Role) => (
                                                    <SelectItem key={role.id} value={role.id.toString()}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.role_id} />
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Switch
                                        id="status"
                                        checked={data.status == '1'}
                                        onCheckedChange={(checked) => setData('status', checked ? '1' : '0')}
                                        className="data-[state=checked]:bg-green-500"
                                    />
                                    <InputError message={errors.status} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}