'use client';

import { useForm, usePage, router, Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar';
import { Plus, Pencil, Trash2, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';

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

export default function Subjects() {
    const { subjects } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [editingSubject, setEditingSubject] = useState<any | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: '',
        code: '',
        description: '',
        type: 'core',
    });

    const openCreate = () => {
        reset();
        setOpen(true);
    };

    const handleEdit = (subject: any) => {
        setEditingSubject(subject);
        setData({
            name: subject.name,
            code: subject.code,
            description: subject.description,
            type: subject.type,
        });
        setEditDialogOpen(true);
    };

    const handleStore = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('subjects.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
                toast.success('Subject created successfully');
            },
            onError: (errors) => {
                toast.error('Failed to create subject');
            }
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubject) return;
        
        patch(route('subjects.update', editingSubject.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditingSubject(null);
                setEditDialogOpen(false);
                toast.success('Subject updated successfully');
            },
            onError: (errors) => {
                toast.error('Failed to update subject');
            }
        });
    };

    const handleDelete = (id: number) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('subjects.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Subject deleted successfully');
                    },
                    onError: () => {
                        toast.error('Failed to delete subject');
                    }
                });
            }
        });
    };

    const filteredData = useMemo(() => {
        return subjects.filter((subject: any) =>
            subject.name.toLowerCase().includes(search.toLowerCase()) ||
            subject.code.toLowerCase().includes(search.toLowerCase())
        );
    }, [subjects, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subject Management" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
                    <HeadingSmall title="Subject Management" description="Update subject management settings" />

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Input
                                type="search"
                                placeholder="Search subjects..."
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
                                    <TableHead>Name</TableHead>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((subject: any) => (
                                    <TableRow key={subject.id}>
                                        <TableCell>{subject.name}</TableCell>
                                        <TableCell>{subject.code}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                subject.type === 'core' 
                                                    ? 'bg-blue-100 text-blue-800' 
                                                    : 'bg-purple-100 text-purple-800'
                                            }`}>
                                                {subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">
                                            {subject.description || '-'}
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleEdit(subject)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={() => handleDelete(subject.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Create Modal */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Subject</DialogTitle>
                                <DialogDescription>
                                    Create a new subject with code and description
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleStore} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Subject Name</Label>
                                    <Input 
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter subject name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="code">Subject Code</Label>
                                    <Input 
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="Enter subject code (e.g., MATH101)"
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div>
                                    <Label htmlFor="type">Subject Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="core">Core</SelectItem>
                                            <SelectItem value="elective">Elective</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input 
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter subject description (optional)"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Add Subject
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Modal */}
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Subject</DialogTitle>
                                <DialogDescription>
                                    Update subject information
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Subject Name</Label>
                                    <Input 
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter subject name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="code">Subject Code</Label>
                                    <Input 
                                        id="code"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="Enter subject code"
                                    />
                                    <InputError message={errors.code} />
                                </div>

                                <div>
                                    <Label htmlFor="type">Subject Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="core">Core</SelectItem>
                                            <SelectItem value="elective">Elective</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>

                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input 
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter subject description"
                                    />
                                    <InputError message={errors.description} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Update Subject
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}