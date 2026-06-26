'use client';

import { useForm, usePage, router, Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar';
import { ChevronUp, ChevronDown, Pencil, Trash2, UserCheck } from 'lucide-react';

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

export default function Departments() {
    const { departments } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [sortBy, setSortBy] = useState<'name'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState('');

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: '',
        description: '',
    });

    const openCreate = () => {
        reset();
        setEditing(null);
        setOpen(true);
    };

    const openEdit = (department: any) => {
        setEditing(department);
        setData({
            name: department.name,
            description: department.description || '',
        });
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            patch(route('departments.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    toast.success('Department updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update department');
                }
            });
        } else {
            post(route('departments.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    toast.success('Department created successfully');
                },
                onError: () => {
                    toast.error('Failed to create department');
                }
            });
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this department. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            router.delete(route('departments.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Department deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete department - it may have associated users or designations');
                }
            });
        }
    };

    const toggleSort = (column: 'name') => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const filteredData = useMemo(() => {
        return departments
            .filter((item: any) =>
                item.name.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a: any, b: any) => {
                const valA = a[sortBy];
                const valB = b[sortBy];

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [departments, search, sortBy, sortDirection]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department Management" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
                    <HeadingSmall title="Department Management" description="Manage your departments effectively" />

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                            type="search"
                            placeholder="Search by name..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-[200px]"
                        />
                        <Button onClick={openCreate}>+ Add</Button>
                    </div>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead onClick={() => toggleSort('name')} className="cursor-pointer flex gap-2 items-center">
                                        Name {sortBy === 'name' && (sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                    </TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((department: any) => (
                                    <TableRow key={department.id}>
                                        <TableCell>{department.name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={department.description || ''}>
                                            {department.description || '-'}
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEdit(department)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(department.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Create/Edit Modal */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name*</Label>
                                    <Input 
                                        id="name" 
                                        value={data.name} 
                                        onChange={(e) => setData('name', e.target.value)} 
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    {editing ? 'Update' : 'Save'}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}