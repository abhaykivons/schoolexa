'use client';

import { useForm, usePage, router, Head } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { arrayMoveImmutable } from 'array-move';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InputError from '@/components/input-error';

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar';
import { Plus, GripVertical, Pencil, Trash2, UserCheck, ChevronUp, ChevronDown } from 'lucide-react';

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

export default function Grades() {
    const { grades } = usePage().props as any;
    const [open, setOpen] = useState(false);
    const [localGrades, setLocalGrades] = useState(grades);
    const [search, setSearch] = useState('');
    const [editingGrade, setEditingGrade] = useState<any | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

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
    });

    const openCreate = () => {
        reset();
        setOpen(true);
    };

    const handleEdit = (grade: any) => {
        setEditingGrade(grade);
        setData('name', grade.name);
        setEditDialogOpen(true);
    };

    const handleStore = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('grades.store'), {
            name: data.name,
            preserveScroll: true,
            onSuccess: (page) => {
                setLocalGrades(page.props.grades);
                reset();
                setOpen(false);
                toast.success('Grade created successfully');
            },
            onError: (errors) => {
                toast.error('Failed to create grade');
            }
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGrade) return;
        
        patch(route('grades.update', editingGrade.id), {
            name: data.name,
            preserveScroll: true,
            onSuccess: (page) => {
                setLocalGrades(page.props.grades);
                reset();
                setEditingGrade(null);
                setEditDialogOpen(false);
                toast.success('Grade updated successfully');
            },
            onError: (errors) => {
                toast.error('Failed to update grade');
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
                router.delete(route('grades.destroy', id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        useEffect(() => {
                            if (props.flash?.success) {
                                setLocalGrades(localGrades.filter((grade: any) => grade.id !== id));
                            }
                        }, [props.flash]);
                    },
                });
            }
        });
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = arrayMoveImmutable(
            localGrades,
            result.source.index,
            result.destination.index
        );

        setLocalGrades(items);

        // Send the new order to the server using POST
        router.post(route('grades.reorder'), {
            grades: items.map((item: any, index: number) => ({
                id: item.id,
                order: index + 1
            })),
            preserveScroll: true,
            onSuccess: (response) => {
                // Update local grades with the fresh ordered list from server
                setLocalGrades(response.props.grades);
                toast.success('Grades reordered successfully');
            },
            onError: () => {
                toast.error('Failed to reorder grades');
                // Revert to previous order if error occurs
                setLocalGrades(grades);
            }
        });
    };

    const filteredData = useMemo(() => {
        return localGrades.filter((item: any) =>
            item.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [localGrades, search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appearance settings" />

            <SettingsLayout>
                <div className="space-y-6 bg-white dark:bg-neutral-900 border p-4 rounded-lg">
                    <HeadingSmall title="Appearance settings" description="Update your account's appearance settings" />

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                            type="search"
                            placeholder="Search grades..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:w-[200px]"
                        />
                        <Button onClick={openCreate}>+ Add</Button>
                    </div>

                    <div className="rounded-md border overflow-x-auto">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead> </TableHead>
                                        <TableHead>Grade Name</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <Droppable droppableId="grades">
                                    {(provided) => (
                                        <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                                            {filteredData.map((grade: any, index: number) => (
                                                <Draggable key={grade.id} draggableId={grade.id.toString()} index={index}>
                                                    {(provided) => (
                                                        <TableRow
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                        >
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <span {...provided.dragHandleProps}>
                                                                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                                    </span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>{grade.name}</TableCell>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell className="flex gap-2">
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={() => handleEdit(grade)}
                                                                >
                                                                <Pencil className="w-4 h-4" />
                                                                </Button>
                                                                <Button 
                                                                    variant="destructive" 
                                                                    size="sm" 
                                                                    onClick={() => handleDelete(grade.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </TableBody>
                                    )}
                                </Droppable>
                            </Table>
                        </DragDropContext>
                    </div>

                    {/* Create Modal */}
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Grade Level</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleStore} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Grade Name (Pre-K to 12)</Label>
                                    <Input 
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter grade name (e.g., 'Pre-K', '1', '12')"
                                    />
                                    <InputError message={errors.name} />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Valid grades: Pre-K, Kindergarten, or 1 through 12
                                    </p>
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Add Grade
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Modal */}
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Grade Level</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Grade Name</Label>
                                    <Input 
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter grade name"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <Button type="submit" disabled={processing}>
                                    Update Grade
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}