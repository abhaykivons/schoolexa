'use client';

import { useForm, usePage, router, Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';
import { Switch } from '@/components/ui/switch';

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

export default function Classes() {
    const { classes, grades, teachers } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [editingClass, setEditingClass] = useState<any | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        name: '',
        grade_id: '',
        capacity: '',
        staff_id: null as string | null,
        status: true,
    })

    const openCreate = () => {
        reset();
        setOpen(true);
    };

    const handleEdit = (classItem: any) => {
        setEditingClass(classItem);
        setData({
            name: classItem.name,
            grade_id: classItem.grade_id.toString(), // Ensure string type
            capacity: classItem.capacity.toString(),
            staff_id: classItem.staff_id ? classItem.staff_id.toString() : null,
            status: classItem.status,
        });
        setEditDialogOpen(true);
    };

    const handleStore = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('classes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
                toast.success('Class created successfully');
            },
            onError: (errors) => {
                toast.error('Failed to create class');
            }
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingClass) return;

        patch(route('classes.update', editingClass.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditingClass(null);
                setEditDialogOpen(false);
                toast.success('Class updated successfully');
            },
            onError: (errors) => {
                toast.error('Failed to update class');
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
                router.delete(route('classes.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Class deleted successfully');
                    },
                    onError: () => {
                        toast.error('Failed to delete class');
                    }
                });
            }
        });
    };

    const filteredData = useMemo(() => {
        return classes.filter((item: any) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.grade?.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [classes, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Classes" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900  border p-4 rounded-lg">
                    <HeadingSmall title="Classes" description="Manage your classes settings" />
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                            type="search"
                            placeholder="Search by classes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-[200px]"
                        />
                        <Button onClick={openCreate}>
                            + Add
                        </Button>
                    </div>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Class Name</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredData.map((classItem: any) => (
                                    <TableRow key={classItem.id}>
                                        <TableCell>{classItem.name}</TableCell>
                                        <TableCell>{classItem.grade?.name}</TableCell>
                                        <TableCell>
                                            {classItem.teacher
                                                ? `${classItem.teacher.full_name}`
                                                : 'Not assigned'}
                                        </TableCell>
                                        <TableCell>{classItem.capacity}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs ${classItem.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {classItem.status ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEdit(classItem)}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(classItem.id)}
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
                                <DialogTitle>Add Class</DialogTitle>
                                <DialogDescription>
                                    Create a new class with grade and teacher assignment
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleStore} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Class Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter class name (e.g., 'A', 'B', '1')"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="grade_id">Grade</Label>
                                    <Select
                                        value={data.grade_id}
                                        onValueChange={(value) => setData('grade_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grades.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                    No grades found
                                                </div>
                                            ) : (
                                                grades.map((grade: any) => (
                                                    <SelectItem key={grade.id} value={grade.id.toString()}>
                                                        {grade.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.grade_id} />
                                </div>

                                <div>
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', e.target.value)}
                                        placeholder="Enter maximum number of students"
                                    />
                                    <InputError message={errors.capacity} />
                                </div>

                                <div>
                                    <Label htmlFor="staff_id">Teacher</Label>
                                    <Select
                                        value={data.staff_id ?? undefined}
                                        onValueChange={(value) => setData('staff_id', value || null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                    No teachers found
                                                </div>
                                            ) : (
                                                teachers.map((teacher: any) => (
                                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                        {teacher.full_name} ({teacher.designation_name} - {teacher.department_name})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.staff_id} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Add Class
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Modal */}
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Class</DialogTitle>
                                <DialogDescription>
                                    Update class information and assignments
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Class Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter class name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="grade_id">Grade</Label>
                                    <Select
                                        value={data.grade_id}
                                        onValueChange={(value) => setData('grade_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {grades.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                    No grades found
                                                </div>
                                            ) : (
                                                grades.map((grade: any) => (
                                                    <SelectItem key={grade.id} value={grade.id.toString()}>
                                                        {grade.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.grade_id} />
                                </div>

                                <div>
                                    <Label htmlFor="capacity">Capacity</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        min="1"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', e.target.value)}
                                        placeholder="Enter maximum number of students"
                                    />
                                    <InputError message={errors.capacity} />
                                </div>

                                <div>
                                    <Label htmlFor="staff_id">Teacher</Label>
                                    <Select
                                        value={data.staff_id ?? undefined}
                                        onValueChange={(value) => setData('staff_id', value || null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">
                                                    No teachers found
                                                </div>
                                            ) : (
                                                teachers.map((teacher: any) => (
                                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                        {teacher.full_name} ({teacher.designation_name} - {teacher.department_name})
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.staff_id} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="status"
                                        checked={data.status}
                                        onCheckedChange={(checked) => setData('status', checked)}
                                    />
                                    <Label htmlFor="status">Active</Label>
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Update Class
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}