'use client';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Swal from 'sweetalert2';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import AppLayout from '@/layouts/app-layout';
import Header from '@/components/header';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import {
    Plus,
    Search,
    MoreVertical,
    Pencil,
    Trash2,
    Eye,
    Copy,
    Power,
    Mail,
    FileText,
    Sparkles,
    Filter,
    X,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Notification Studio',
        href: '/notification-studio',
    },
    {
        title: 'Email Templates',
        href: '/notification-studio/templates',
    },
];

interface Template {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    category: string;
    event_type: string;
    subject: string;
    body: string;
    is_active: boolean;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}

interface PageProps {
    templates: {
        data: Template[];
        links: any;
        meta: any;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Record<string, string>;
    eventTypes: Record<string, {
        label: string;
        category: string;
        description: string;
        variables: string[];
    }>;
    filters: {
        category?: string;
        search?: string;
        status?: string;
    };
}

// Category colors for visual distinction
const categoryColors: Record<string, string> = {
    parent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    student: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    staff: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    enrollment: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    admission: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    approval: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    notification: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

// Category icons
const categoryIcons: Record<string, React.ReactNode> = {
    parent: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    student: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>,
    staff: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
    enrollment: <FileText className="w-4 h-4" />,
    admission: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" x2="19" y1="8" y2="14" /><line x1="22" x2="16" y1="11" y2="11" /></svg>,
    approval: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
    notification: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    general: <Mail className="w-4 h-4" />,
};

export default function EmailTemplatesIndex() {
    const { templates, categories, eventTypes, filters, flash, auth } = usePage<PageProps & { auth: any; flash?: { success?: string; error?: string } }>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
    const [previewContent, setPreviewContent] = useState<{ subject: string; body: string } | null>(null);
    const [isInitialMount, setIsInitialMount] = useState(true);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    useEffect(() => {
        // Skip the initial mount to prevent resetting page on first render
        if (isInitialMount) {
            setIsInitialMount(false);
            return;
        }

        const timeout = setTimeout(() => {
            const params: Record<string, string> = {};
            if (search) params.search = search;
            if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
            if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;

            router.get(route('notification-studio.templates.index'), params, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, selectedCategory, selectedStatus]);

    const handleDelete = (template: Template) => {
        if (template.is_default) {
            toast.error('Cannot delete a default template');
            return;
        }

        Swal.fire({
            title: 'Delete Template?',
            text: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('notification-studio.templates.destroy', template.id), {
                    preserveScroll: true,
                });
            }
        });
    };

    const handleToggleStatus = (template: Template) => {
        router.patch(route('notification-studio.templates.toggle-status', template.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDuplicate = (template: Template) => {
        router.post(route('notification-studio.templates.duplicate', template.id), {}, {
            preserveScroll: true,
        });
    };

    const handlePreview = async (template: Template) => {
        setPreviewTemplate(template);
        try {
            const response = await fetch(route('notification-studio.templates.preview', template.id));
            const data = await response.json();
            setPreviewContent({
                subject: data.subject,
                body: data.body,
            });
        } catch (error) {
            toast.error('Failed to load preview');
        }
    };

    const handleSeedDefaults = () => {
        Swal.fire({
            title: 'Create Default Templates?',
            text: 'This will create default templates for all event types that don\'t have templates yet.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, create them!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('notification-studio.templates.seed-defaults'), {}, {
                    preserveScroll: true,
                });
            }
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('all');
        setSelectedStatus('all');
        router.get(route('notification-studio.templates.index'));
    };

    const hasActiveFilters = search || (selectedCategory && selectedCategory !== 'all') || (selectedStatus && selectedStatus !== 'all');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Email Templates" />
            <div className="flex flex-col min-h-screen">
                <Header user={auth.user} breadcrumbs={breadcrumbs} />
                <div className="p-2 pt-0 mb-12 lg:mb-0 md:mb-0">
                    <div className="space-y-6 bg-white dark:bg-neutral-900 border p-6 rounded-xl">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <HeadingSmall 
                                title="Email Templates" 
                                description="Customize email templates for different events and notifications" 
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleSeedDefaults}
                                className="gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span className="hidden sm:inline">Generate Defaults</span>
                            </Button>
                            <Button asChild className="gap-2 bg-green-600 hover:bg-green-700">
                                <Link href={route('notification-studio.templates.create')}>
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">New Template</span>
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="p-4 bg-gray-50 dark:bg-neutral-800 border-0">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="search"
                                    placeholder="Search templates..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10 bg-white dark:bg-neutral-900"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-neutral-900">
                                    <Filter className="w-4 h-4 mr-2 text-gray-400" />
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {Object.entries(categories).map(([key, label]) => (
                                        <SelectItem key={key} value={key}>
                                            <span className="flex items-center gap-2">
                                                {categoryIcons[key]}
                                                {label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger className="w-full sm:w-[140px] bg-white dark:bg-neutral-900">
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="icon" onClick={clearFilters}>
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Templates Table */}
                    <div className="rounded-lg border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-neutral-800">
                                    <TableHead className="w-[300px]">Template</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Event Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {templates.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-500">
                                                <Mail className="w-10 h-10 opacity-50" />
                                                <p>No templates found</p>
                                                <Button
                                                    variant="link"
                                                    onClick={handleSeedDefaults}
                                                    className="text-green-600"
                                                >
                                                    Generate default templates
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    templates.data.map((template) => (
                                        <TableRow key={template.id} className="group">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium flex items-center gap-2">
                                                        {template.name}
                                                        {template.is_default && (
                                                            <Badge variant="outline" className="text-xs">
                                                                Default
                                                            </Badge>
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-gray-500 truncate max-w-[280px]">
                                                        {template.subject}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${categoryColors[template.category]} font-normal`}>
                                                    <span className="flex items-center gap-1.5">
                                                        {categoryIcons[template.category]}
                                                        {categories[template.category]}
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {eventTypes[template.event_type]?.label || template.event_type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={template.is_active ? 'default' : 'secondary'}
                                                    className={template.is_active 
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200' 
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                                    }
                                                >
                                                    {template.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handlePreview(template)}>
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Preview
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('notification-studio.templates.edit', template.id)}>
                                                                <Pencil className="w-4 h-4 mr-2" />
                                                                Edit
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                                                            <Copy className="w-4 h-4 mr-2" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleStatus(template)}>
                                                            <Power className="w-4 h-4 mr-2" />
                                                            {template.is_active ? 'Deactivate' : 'Activate'}
                                                        </DropdownMenuItem>
                                                        {!template.is_default && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(template)}
                                                                    className="text-red-600 focus:text-red-600"
                                                                >
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {templates.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Showing {templates.data.length} of {templates.total} templates
                            </p>
                            <div className="flex gap-1">
                                {templates.links?.map((link: any, index: number) => (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview Dialog */}
                <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
                    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Eye className="w-5 h-5" />
                                Email Preview: {previewTemplate?.name}
                            </DialogTitle>
                        </DialogHeader>
                        {previewContent && (
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg">
                                    <p className="text-sm text-gray-500 mb-1">Subject</p>
                                    <p className="font-medium">{previewContent.subject}</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-neutral-900 border rounded-lg">
                                    <p className="text-sm text-gray-500 mb-2">Body</p>
                                    <div 
                                        className="prose prose-sm dark:prose-invert max-w-none"
                                        dangerouslySetInnerHTML={{ __html: previewContent.body }}
                                    />
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                    <p className="text-sm text-amber-800 dark:text-amber-200">
                                        <strong>Note:</strong> This preview uses sample data. Actual emails will contain real information.
                                    </p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}

