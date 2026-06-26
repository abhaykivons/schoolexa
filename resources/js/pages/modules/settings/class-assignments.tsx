'use client';

import { useForm, usePage, router, Head } from '@inertiajs/react';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InputError from '@/components/input-error';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar';
import { Plus, Pencil, Trash2, UserCheck, ChevronUp, ChevronDown, } from 'lucide-react';
import { Label } from '@/components/ui/label';

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

export default function ClassAssignments() {
    const { classes, subjects, teachers } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
    const [selectedClass, setSelectedClass] = useState<any | null>(null);

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        class_id: '',
        subject_id: '',
        staff_id: '',
    });

    const openCreate = (classItem: any) => {
        reset();
        setSelectedClass(classItem);
        setData('class_id', classItem.id);
        setOpen(true);
    };

    const handleEdit = (assignment: any, classItem: any) => {
        setEditingAssignment(assignment);
        setSelectedClass(classItem);
        setData({
            staff_id: assignment.pivot.staff_id.toString(),
        });
    };

    const handleStore = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('class-assignments.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setOpen(false);
                toast.success('Assignment created successfully');
            },
            onError: (errors) => {
                toast.error('Failed to create assignment');
            }
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAssignment) return;
        
        patch(route('class-assignments.update', editingAssignment.pivot.id), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setEditingAssignment(null);
                toast.success('Assignment updated successfully');
            },
            onError: (errors) => {
                toast.error('Failed to update assignment');
            }
        });
    };

    const handleDelete = (assignmentId: number) => {
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
                router.delete(route('class-assignments.destroy', assignmentId), {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('Assignment deleted successfully');
                    },
                    onError: () => {
                        toast.error('Failed to delete assignment');
                    }
                });
            }
        });
    };

    return (

        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Class-Subject Assignments" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
                    <HeadingSmall title="Class-Subject Assignments" description="Manage class-subject assignments" />
                    <div className="space-y-8">
                        {classes.map((classItem: any) => (
                            <div key={classItem.id} className="rounded-md border overflow-hidden">
                                <div className="bg-gray-50 dark:bg-neutral-800 px-4 py-3 border-b">
                                    <h3 className="font-medium">
                                        {classItem.name} ({classItem.grade.name})
                                        {classItem.class_teacher && (
                                            <span className="text-sm text-muted-foreground ml-2">
                                                Class Teacher: {classItem.class_teacher.full_name} ({classItem.class_teacher.designation_name} - {classItem.class_teacher.department_name})
                                            </span>
                                        )}
                                    </h3>
                                </div>
                                
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-medium">Subject Assignments</h4>
                                        <Button size="sm" onClick={() => openCreate(classItem)}>+
                                            Add Subject
                                        </Button>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Subject</TableHead>
                                                <TableHead>Code</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Assigned Teacher</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {classItem.subjects.length > 0 ? (
                                                classItem.subjects.map((subject: any) => (
                                                    <TableRow key={subject.pivot.id}>
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
                                                        <TableCell>
                                                            {subject.teachers.find((t: any) => t.id === subject.pivot.staff_id)?.full_name || 'Not assigned'}
                                                        </TableCell>
                                                        <TableCell className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(subject, classItem)}
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(subject.pivot.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                                        No subjects assigned yet
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Create Assignment Modal */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Add Subject to {selectedClass?.name} ({selectedClass?.grade.name})
                                </DialogTitle>
                                <DialogDescription>
                                    Assign a subject and teacher to this class
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleStore} className="space-y-4">
                                <input type="hidden" name="class_id" value={data.class_id} />

                                <div>
                                    <Label htmlFor="subject_id">Subject</Label>
                                    <Select
                                        value={data.subject_id}
                                        onValueChange={(value) => setData('subject_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects
                                                .filter((subject: any) => 
                                                    !selectedClass?.subjects.some((s: any) => s.id === subject.id)
                                                )
                                                .map((subject: any) => (
                                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                                        {subject.name} ({subject.code})
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.subject_id} />
                                </div>

                                <div>
                                    <Label htmlFor="staff_id">Teacher</Label>
                                    <Select
                                        value={data.staff_id}
                                        onValueChange={(value) => setData('staff_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select teacher" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {teachers.map((teacher: any) => (
                                                <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                    {teacher.full_name} ({teacher.designation_name} - {teacher.department_name})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.staff_id} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Assign Subject
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Assignment Modal */}
                    {editingAssignment && selectedClass && (
                        <Dialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Edit Assignment for {editingAssignment.name}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Update teacher assignment for this subject
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                        <Label htmlFor="staff_id">Teacher</Label>
                                        <Select
                                            value={data.staff_id}
                                            onValueChange={(value) => setData('staff_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select teacher" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teachers.map((teacher: any) => (
                                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                                                        {teacher.full_name} ({teacher.designation_name} - {teacher.department_name})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.staff_id} />
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        Update Assignment
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>

    );
}