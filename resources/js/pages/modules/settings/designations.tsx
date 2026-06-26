'use client';

import { useForm, usePage, router, Head } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronUp, ChevronDown, Pencil, Trash2, UserCheck, LockKeyholeOpen } from 'lucide-react';

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

export default function Designations() {
    const { designations } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'hierarchy_level'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState('');

    const { props } = usePage<{ flash: { success?: string; error?: string } }>();

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success);
        }
        if (props.flash?.error) {
            toast.error(props.flash.error);
        }
    }, [props.flash]);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: '',
        hierarchy_level: '',
        type: '',
        description: '',
        is_visible: '',
    });

    const openCreate = () => {
        reset();
        setEditing(null);
        setOpen(true);
    };

    const openEdit = (designation: any) => {
        setEditing(designation);
        setData({
            name: designation.name,
            hierarchy_level: designation.hierarchy_level,
            type: designation.type || '',
            description: designation.description || '',
            is_visible: designation.is_visible.toString(),
        });
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            patch(route('designations.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    toast.success('Designation updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update designation');
                }
            });
        } else {
            post(route('designations.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    toast.success('Designation created successfully');
                },
                onError: () => {
                    toast.error('Failed to create designation');
                }
            });
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this designation. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            router.delete(route('designations.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    
                },
                onError: () => {
                    
                }
            });
        }
    };

    const toggleSort = (column: 'name' | 'hierarchy_level') => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const filteredData = useMemo(() => {
        return designations
            .filter((item: any) =>
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                (item.type && item.type.toLowerCase().includes(search.toLowerCase()))
            )
            .sort((a: any, b: any) => {
                const valA = a[sortBy];
                const valB = b[sortBy];

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [designations, search, sortBy, sortDirection]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Designations Management" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
                    <HeadingSmall title="Designations Management" description="Manage your designations" />

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                            type="search"
                            placeholder="Search by title or type..."
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
                                        Title {sortBy === 'name' && (sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                    </TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead onClick={() => toggleSort('hierarchy_level')} className="cursor-pointer flex gap-2 items-center">
                                        Hierarchy Level {sortBy === 'hierarchy_level' && (sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                    </TableHead>
                                    <TableHead>Visibility</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((designation: any) => (
                                    <TableRow key={designation.id}>
                                        <TableCell>{designation.name}</TableCell>
                                        <TableCell>{designation.type || '-'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={designation.description || ''}>
                                            {designation.description || '-'}
                                        </TableCell>
                                        <TableCell>{designation.hierarchy_level}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                designation.is_visible == '1' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {designation.is_visible == '1' ? 'Visible to all' : 'Restricted'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => openEdit(designation)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Edit</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(designation.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Delete</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        className="bg-yellow-600 hover:bg-yellow-700 text-white"
                                                        size="sm"
                                                        onClick={() => router.visit(route('designations.show', designation.id))}
                                                    >
                                                        <LockKeyholeOpen className="w-4 h-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Permissions</p>
                                                </TooltipContent>
                                            </Tooltip>
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
                                <DialogTitle>{editing ? 'Edit Designation' : 'Add Designation'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div className='grid grid-cols-2 gap-4'>
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
                                        <Label htmlFor="is_visible">Visibility</Label>
                                        <Select
                                            value={data.is_visible}
                                            onValueChange={(value) => setData('is_visible', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select visibility" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Visible to all</SelectItem>
                                                <SelectItem value="0">Restricted</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.is_visible} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="hierarchy_level">Hierarchy Level*</Label>
                                        <Input
                                            id="hierarchy_level"
                                            type="number"
                                            min="1"
                                            value={data.hierarchy_level}
                                            onChange={(e) => setData('hierarchy_level', e.target.value)}
                                        />
                                        <InputError message={errors.hierarchy_level} />
                                    </div>

                                    <div>
                                        <Label htmlFor="type">Type</Label>
                                        <Input
                                            id="type"
                                            value={data.type}
                                            onChange={(e) => setData('type', e.target.value)}
                                            placeholder="e.g., Academic, Administrative"
                                        />
                                        <InputError message={errors.type} />
                                    </div>
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