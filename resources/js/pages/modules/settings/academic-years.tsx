'use client';

import { useForm, usePage, router, Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import InputError from '@/components/input-error';

import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';

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

export default function AcademicYears() {
    const { academicYears } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [sortBy, setSortBy] = useState<'name' | 'start_date' | 'end_date'>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [search, setSearch] = useState('');

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: '',
        start_date: '',
        end_date: '',
    });

    const openCreate = () => {
        reset();
        setEditing(null);
        setOpen(true);
    };

    const openEdit = (year: any) => {
        setEditing(year);
        setData({
            name: year.name,
            start_date: year.start_date,
            end_date: year.end_date,
        });
        setOpen(true);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editing) {
            patch(route('academic-years.update', editing.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    toast.success('Academic year updated successfully');
                },
                onError: () => {
                    toast.error('Failed to update academic year');
                }
            });
        } else {
            post(route('academic-years.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setOpen(false);
                    toast.success('Academic year created successfully');
                },
                onError: () => {
                    toast.error('Failed to create academic year');
                }
            });
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this academic year. This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            router.delete(route('academic-years.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Academic year deleted successfully');
                },
                onError: () => {
                    toast.error('Failed to delete academic year');
                }
            });
        }
    };

    const toggleCurrentYear = async (year: any) => {
        if (year.current) {
            // If user is trying to turn off the current year, show a message
            toast.info('You cannot turn off the current academic year. Please set another year as current instead.');
            return;
        }
        
        const result = await Swal.fire({
            title: 'Change Current Academic Year?',
            text: `Are you sure you want to set ${year.name} as the current academic year? This will unset any other current year.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, set as current'
        });

        if (result.isConfirmed) {
            router.patch(route('academic-years.set-current', year.id), {
                preserveScroll: true,
                onSuccess: () => {
                    // Update the local state to reflect the change immediately
                    const updatedYears = academicYears.map((y: any) => ({
                        ...y,
                        current: y.id === year.id
                    }));
                    usePage().props.academicYears = updatedYears;
                    toast.success(`${year.name} is now the current academic year`);
                },
                onError: () => {
                    toast.error('Failed to set current academic year');
                }
            });
        }
    };

    const toggleSort = (column: 'name' | 'start_date' | 'end_date') => {
        if (sortBy === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const filteredData = useMemo(() => {
        return academicYears
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
    }, [academicYears, search, sortBy, sortDirection]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Academic year Management" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
                    <HeadingSmall title="Academic Year Management" description="Manage your academic years" />

                    <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
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
                    </div>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead onClick={() => toggleSort('name')} className="cursor-pointer items-center">
                                        Name {sortBy === 'name' && (sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                    </TableHead>
                                    <TableHead onClick={() => toggleSort('start_date')} className="cursor-pointer items-center">
                                        Start Date {sortBy === 'start_date' && (sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                    </TableHead>
                                    <TableHead onClick={() => toggleSort('end_date')} className="cursor-pointer">
                                        End Date {sortBy === 'end_date' && (sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                                    </TableHead>
                                    <TableHead>Current</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody >
                                {filteredData.map((year: any) => (
                                    <TableRow key={year.id} >
                                        <TableCell>{year.name}</TableCell>
                                        <TableCell>{format(new Date(year.start_date), 'yyyy-MM-dd')}</TableCell>
                                        <TableCell>{format(new Date(year.end_date), 'yyyy-MM-dd')}</TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={year.current}
                                                onCheckedChange={() => toggleCurrentYear(year)}
                                                className="data-[state=checked]:bg-green-500"
                                            />
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openEdit(year)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDelete(year.id)}>
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
                                <DialogTitle>{editing ? 'Edit Academic Year' : 'Add Academic Year'}</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input id="start_date" type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
                                    <InputError message={errors.start_date} />
                                </div>

                                <div>
                                    <Label htmlFor="end_date">End Date</Label>
                                    <Input id="end_date" type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
                                    <InputError message={errors.end_date} />
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